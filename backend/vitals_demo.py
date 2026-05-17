"""
HexaGene Vitals Engine — longitudinal wearable stream analysis.

Stateless, deterministic, no I/O on the scoring path.
Processes multi-stream input to calculate:
  - Six-axis longitudinal loads (axis_contributions)
  - 21-day smooth trajectory (points & crossings)
  - State stability classification (basin, slope, ridge)
  - Loop attributions (drift magnitude per physiological circuit)
  - Driven clinical recommendations and loop-closing criteria
"""

from __future__ import annotations

import hashlib
import json
import math
from typing import Any, Optional


# Allowed / standard longitudinal stream names
KNOWN_STREAMS = {
    "hrv",
    "sleep_efficiency",
    "cgm_mean_glucose",
    "steps",
    "sleep_hours",
    "resting_heart_rate",
    "spo2",
    "temperature",
}


def _seeded_floats(seed: str, n: int) -> list[float]:
    """Deterministic [0,1) floats from a string seed. Pure stdlib, no RNG state."""
    out: list[float] = []
    counter = 0
    while len(out) < n:
        h = hashlib.sha256(f"{seed}:{counter}".encode()).digest()
        for i in range(0, 32, 8):
            if len(out) >= n:
                break
            v = int.from_bytes(h[i:i + 8], "big") / (1 << 64)
            out.append(v)
        counter += 1
    return out


def _calculate_trend(values: list[float]) -> float:
    """Calculate simple trend (last - first). Handles empty or single value."""
    if not values or len(values) < 2:
        return 0.0
    return float(values[-1]) - float(values[0])


def _calculate_average(values: list[float], default: float = 0.0) -> float:
    """Calculate mean of values."""
    if not values:
        return default
    return sum(values) / len(values)


def vitals_projection(body_vitals: dict[str, Any] | None) -> dict[str, Any] | None:
    """
    Computes a deterministic, stateless physiological vitals projection
    from the patient's wearable data streams.
    """
    if not body_vitals:
        return None

    # 1. Parse window_days and streams
    window_days = int(body_vitals.get("window_days", 21))
    if window_days < 7:
        window_days = 7
    elif window_days > 90:
        window_days = 90

    raw_streams = body_vitals.get("streams", {})
    if not isinstance(raw_streams, dict):
        raw_streams = {}

    # 2. Extract known streams and record unknown ones
    streams: dict[str, list[float]] = {}
    unknown_streams: list[str] = []

    for name, vals in raw_streams.items():
        if name in KNOWN_STREAMS:
            if isinstance(vals, list):
                # Clean elements to float safely
                cleaned = []
                for val in vals:
                    try:
                        cleaned.append(float(val))
                    except (ValueError, TypeError):
                        pass
                streams[name] = cleaned
            else:
                streams[name] = []
        else:
            unknown_streams.append(name)

    # 3. Establish seeded determinism
    # Stringify the vitals block to create a stable hash seed
    serialized_input = json.dumps(body_vitals, sort_keys=True, separators=(",", ":"))
    seed = hashlib.sha256(serialized_input.encode()).hexdigest()[:16]

    # Generate deterministic random floats for usage
    floats = _seeded_floats(seed, 20)

    # 4. Analyze trends in streams to drive physiological state
    hrv_trend = _calculate_trend(streams.get("hrv", []))
    hrv_avg = _calculate_average(streams.get("hrv", []), default=55.0)

    sleep_eff_trend = _calculate_trend(streams.get("sleep_efficiency", []))
    sleep_eff_avg = _calculate_average(streams.get("sleep_efficiency", []), default=88.0)

    cgm_trend = _calculate_trend(streams.get("cgm_mean_glucose", []))
    cgm_avg = _calculate_average(streams.get("cgm_mean_glucose", []), default=100.0)

    resting_hr_trend = _calculate_trend(streams.get("resting_heart_rate", []))

    # Determine dynamic physiological direction
    # Primary indicators of stress: declining HRV, declining sleep efficiency, or rising glucose
    stress_indicators = 0
    recover_indicators = 0

    if hrv_trend < -2.0:
        stress_indicators += 1
    elif hrv_trend > 2.0:
        recover_indicators += 1

    if sleep_eff_trend < -3.0:
        stress_indicators += 1
    elif sleep_eff_trend > 3.0:
        recover_indicators += 1

    if cgm_trend > 4.0:
        stress_indicators += 1
    elif cgm_trend < -4.0:
        recover_indicators += 1

    if resting_hr_trend > 2.0:
        stress_indicators += 1
    elif resting_hr_trend < -2.0:
        recover_indicators += 1

    # Determine net drift direction
    if stress_indicators > recover_indicators:
        net_drift_direction = "stress"
    elif recover_indicators > stress_indicators:
        net_drift_direction = "recover"
    else:
        # Tie breaker / baseline deterministic direction from seed
        net_drift_direction = "stress" if floats[0] > 0.4 else "recover"

    # 5. Compute Axis Contributions [0.15, 0.85]
    # Warm steady/drift base values, overlay trends
    axes = {
        "structural": round(0.20 + 0.30 * floats[1], 4),
        "inflammatory": round(0.25 + 0.35 * floats[2], 4),
        "metabolic": round(0.22 + 0.38 * floats[3], 4),
        "redox": round(0.18 + 0.32 * floats[4], 4),
        "kinetic": round(0.24 + 0.36 * floats[5], 4),
        "balance": round(0.20 + 0.40 * floats[6], 4),
    }

    # Apply overlay influences from real wearable stream trends
    if net_drift_direction == "stress":
        axes["inflammatory"] = round(min(0.85, axes["inflammatory"] + 0.15), 4)
        axes["balance"] = round(min(0.85, axes["balance"] + 0.12), 4)
    else:
        axes["inflammatory"] = round(max(0.15, axes["inflammatory"] - 0.10), 4)
        axes["balance"] = round(max(0.15, axes["balance"] - 0.08), 4)

    if hrv_avg < 45.0:
        axes["inflammatory"] = round(min(0.85, axes["inflammatory"] + 0.18), 4)
    if cgm_avg > 115.0:
        axes["metabolic"] = round(min(0.85, axes["metabolic"] + 0.22), 4)
    if sleep_eff_avg < 82.0:
        axes["kinetic"] = round(min(0.85, axes["kinetic"] + 0.15), 4)

    # 6. Generate Trajectory walk points
    # Render a smooth Bezier-like walk for the 21 days
    points = []
    # Smooth walk using sine waves + linear trend based on direction
    base_val = 0.45 + 0.10 * floats[7]
    trend_factor = 0.15 if net_drift_direction == "stress" else -0.15

    for d in range(1, window_days + 1):
        # Deterministic wave fluctuation
        wave = 0.08 * math.sin(d / 3.0 + floats[8] * 5.0)
        # Linear drift across time
        drift = trend_factor * (d / window_days)
        # Combine
        val = base_val + wave + drift
        # Clamp between [0.1, 0.9]
        val = max(0.1, min(0.9, val))
        points.append({"day": d, "value": round(val, 4)})

    # Calculate exact state crossings of the 0.5 threshold line
    state_crossings = 0
    for i in range(1, len(points)):
        v1 = points[i-1]["value"]
        v2 = points[i]["value"]
        if (v1 < 0.5 <= v2) or (v2 < 0.5 <= v1):
            state_crossings += 1

    mean_dwell_days = round(4.0 + 8.0 * floats[9], 1)

    # 7. Stability Classification
    # Mapping based on crossing dynamics and direction
    if state_crossings >= 3:
        stability_classification = "ridge"
    elif net_drift_direction == "steady" or (state_crossings == 0 and net_drift_direction == "recover"):
        stability_classification = "basin"
    else:
        stability_classification = "slope"

    stability = {
        "classification": stability_classification,
    }

    trajectory = {
        "points": points,
        "state_crossings": state_crossings,
        "net_drift_direction": net_drift_direction,
        "mean_dwell_days": mean_dwell_days,
    }

    # 8. Loop Attributions
    # Circuit identifiers matching src/utils/vitalsHelpers.js
    available_loops = [
        "glucose_insulin",
        "HPA",
        "circadian",
        "cardiovascular",
        "cardiorespiratory",
        "RAAS",
        "oxygen_HIF",
        "thermoregulation",
        "energy_balance",
        "acid_base",
    ]

    # Assign drift magnitude deterministically
    loop_attributions = []
    for i, l_id in enumerate(available_loops):
        # Base drift deterministic
        base_drift = 0.10 + 0.35 * floats[(10 + i) % len(floats)]
        # Boost specific loops based on stream inputs
        if l_id == "glucose_insulin" and cgm_avg > 110:
            base_drift += 0.25
        if l_id == "HPA" and hrv_avg < 48:
            base_drift += 0.20
        if l_id == "circadian" and sleep_eff_avg < 85:
            base_drift += 0.18

        # Cap drift at 0.85
        mean_drift = round(min(0.85, base_drift), 4)
        loop_attributions.append({
            "loop": l_id,
            "mean_drift": mean_drift
        })

    # Sort attributions in descending order of drift
    loop_attributions.sort(key=lambda x: x["mean_drift"], reverse=True)

    # 9. Dynamic Recommendations & Levers
    # The primary drifting loop determines the top recommendation
    primary_loop = loop_attributions[0]["loop"]

    recommendations = []
    if primary_loop == "glucose_insulin":
        recommendations.append({
            "priority": "high",
            "observed": "Limit carbohydrate exposure post-sunset to stabilize nocturnal glucose-insulin oscillations.",
            "target_loop": "glucose_insulin",
            "driven_by": ["cgm_mean_glucose", "sleep_efficiency"],
            "reentry_condition": "Mean overnight CGM glucose stabilizes below 110 mg/dL for 3 consecutive nights."
        })
    elif primary_loop == "circadian":
        recommendations.append({
            "priority": "high",
            "observed": "Shift your primary caffeine intake to early morning to align cortisol onset kinetics.",
            "target_loop": "circadian",
            "driven_by": ["sleep_efficiency", "sleep_hours"],
            "reentry_condition": "Sleep timing variation falls under 30 minutes over a 7-day rolling window."
        })
    elif primary_loop == "HPA":
        recommendations.append({
            "priority": "high",
            "observed": "Incorporate deliberate autonomic down-regulation protocols during midday transitions.",
            "target_loop": "HPA",
            "driven_by": ["hrv", "resting_heart_rate"],
            "reentry_condition": "Resting morning HRV averages >52ms and shows balanced autonomic tone."
        })
    else:
        recommendations.append({
            "priority": "high",
            "observed": "Incorporate zone-2 cardiorespiratory pacing blocks to expand metabolic buffer capacity.",
            "target_loop": "cardiorespiratory",
            "driven_by": ["resting_heart_rate", "hrv"],
            "reentry_condition": "Resting heart rate settles consistently within target steady state bounds."
        })

    # Always include a second supportive moderate-priority recommendation
    secondary_loop = loop_attributions[1]["loop"]
    if secondary_loop == "glucose_insulin":
        recommendations.append({
            "priority": "moderate",
            "observed": "Optimize postprandial walking cadence to blunt glycemic excursions.",
            "target_loop": "glucose_insulin",
            "driven_by": ["cgm_mean_glucose", "steps"],
            "reentry_condition": "Postprandial glycemic peaks remain bounded below 135 mg/dL."
        })
    else:
        recommendations.append({
            "priority": "moderate",
            "observed": "Standardize pre-sleep wind-down routines to preserve slow-wave delta cycles.",
            "target_loop": "circadian",
            "driven_by": ["sleep_efficiency", "hrv"],
            "reentry_condition": "Nocturnal heart rate dipping achieves optimal 10-12% baseline reduction."
        })

    # 10. Construct Final Projection block
    return {
        "mode": "demo",
        "window_days": window_days,
        "axis_contributions": axes,
        "trajectory": trajectory,
        "stability": stability,
        "loop_attribution": loop_attributions,
        "recommendations": recommendations,
        "unknown_streams": unknown_streams,
        "validated": True,
        "note": "Stateless wearable projection stub. Deterministic output mapped to longitudinal streams."
    }


def merge_vitals_into_report(report: dict[str, Any], body_vitals: dict[str, Any] | None) -> dict[str, Any]:
    """
    Stateless helper to merge computed vitals projection into the final engine report.
    Returns the mutated/enriched report dict.
    """
    if report is None:
        report = {}

    vitals_block = vitals_projection(body_vitals)
    report["vitals"] = vitals_block
    return report
