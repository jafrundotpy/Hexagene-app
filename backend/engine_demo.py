"""
HexaGene Demo Engine
====================

Drop-in stub that implements the public response contract documented in
§5 of the Backend & Hosting Overview. Same input → same output, every time.

This module exists so the frontend, gateway, and ops layers can integrate
end-to-end before the proprietary scoring engine is dropped in. When the
real engine ships, replace `patient_report()` below with the production
implementation; the HTTP wrapper, schemas, container, and frontend do not
change.

What this demo deliberately does NOT contain:
  - kernel coefficients
  - axis weights / threshold scales
  - variant scoring formula
  - master-table physics constants

Outputs are computed from a deterministic hash of the input so that the
frontend sees plausible, stable values. They are NOT clinical scores.
"""

from __future__ import annotations

import hashlib
import json
import time
from datetime import datetime, timezone
from typing import Any, Optional

VERSION = "2.0.0-demo"
ENGINE = "HexaGene S21 (demo)"
KERNEL_DESC = "demo-stub (production: 238+ IBM QPU jobs, ibm_fez 156q)"
BUILD = "2026.05-demo.1"


# -----------------------------------------------------------------------------
# Determinism helper
# -----------------------------------------------------------------------------

def _seeded_floats(seed: str, n: int) -> list[float]:
    """Deterministic [0,1) floats from a string seed. Pure stdlib, no RNG state."""
    out: list[float] = []
    counter = 0
    while len(out) < n:
        h = hashlib.sha256(f"{seed}:{counter}".encode()).digest()
        # 8 bytes → 64-bit int → float in [0,1)
        for i in range(0, 32, 8):
            if len(out) >= n:
                break
            v = int.from_bytes(h[i:i + 8], "big") / (1 << 64)
            out.append(v)
        counter += 1
    return out


def _input_seed(patient: dict[str, Any]) -> str:
    """Stable seed: same patient dict → same seed."""
    return hashlib.sha256(
        json.dumps(patient, sort_keys=True, separators=(",", ":")).encode()
    ).hexdigest()[:16]


# -----------------------------------------------------------------------------
# Built-in compound database (small, public-knowledge subset for demo only)
# -----------------------------------------------------------------------------

_DRUG_DB: dict[str, dict[str, Any]] = {
    "metformin":     {"name": "Metformin",     "class": "Antidiabetic", "serotonergic": False, "targets": {}},
    "atorvastatin":  {"name": "Atorvastatin",  "class": "Statin",       "serotonergic": False, "targets": {"CYP3A4": 0.15}},
    "simvastatin":   {"name": "Simvastatin",   "class": "Statin",       "serotonergic": False, "targets": {"CYP3A4": 0.20}},
    "rosuvastatin":  {"name": "Rosuvastatin",  "class": "Statin",       "serotonergic": False, "targets": {"CYP2C9": 0.10}},
    "sertraline":    {"name": "Sertraline",    "class": "SSRI",         "serotonergic": True,  "targets": {"CYP2D6": 0.25, "CYP3A4": 0.10, "SERT": 0.45}},
    "fluoxetine":    {"name": "Fluoxetine",    "class": "SSRI",         "serotonergic": True,  "targets": {"CYP2D6": 0.40, "SERT": 0.50}},
    "paroxetine":    {"name": "Paroxetine",    "class": "SSRI",         "serotonergic": True,  "targets": {"CYP2D6": 0.55, "SERT": 0.50}},
    "omeprazole":    {"name": "Omeprazole",    "class": "PPI",          "serotonergic": False, "targets": {"CYP3A4": 0.10, "CYP1A2": 0.15}},
    "esomeprazole":  {"name": "Esomeprazole",  "class": "PPI",          "serotonergic": False, "targets": {"CYP3A4": 0.10}},
    "warfarin":      {"name": "Warfarin",      "class": "Anticoagulant","serotonergic": False, "targets": {"CYP2C9": 0.45, "CYP3A4": 0.15}},
    "clopidogrel":   {"name": "Clopidogrel",   "class": "Antiplatelet", "serotonergic": False, "targets": {"CYP2C19": 0.40}},
    "lisinopril":    {"name": "Lisinopril",    "class": "ACE-i",        "serotonergic": False, "targets": {}},
    "amlodipine":    {"name": "Amlodipine",    "class": "CCB",          "serotonergic": False, "targets": {"CYP3A4": 0.20}},
    "metoprolol":    {"name": "Metoprolol",    "class": "Beta-blocker", "serotonergic": False, "targets": {"CYP2D6": 0.30}},
    "ibuprofen":     {"name": "Ibuprofen",     "class": "NSAID",        "serotonergic": False, "targets": {"CYP2C9": 0.20}},
    "tramadol":      {"name": "Tramadol",      "class": "Opioid",       "serotonergic": True,  "targets": {"CYP2D6": 0.35, "CYP3A4": 0.15}},
    "codeine":       {"name": "Codeine",       "class": "Opioid",       "serotonergic": False, "targets": {"CYP2D6": 0.40}},
    "levothyroxine": {"name": "Levothyroxine", "class": "Thyroid",      "serotonergic": False, "targets": {}},
}

# Recognised lab markers (for present/missing tracking and confidence scoring)
_KNOWN_MARKERS = {
    "albumin", "hemoglobin", "crp", "nlr", "hba1c", "triglycerides",
    "rdw", "egfr", "hdl", "ldl", "uric_acid", "creatinine", "glucose",
    "wbc", "platelets", "alt", "ast", "tsh", "ferritin",
}

# Genes with tissue annotations for the demo
_GENE_TISSUE: dict[str, list[str]] = {
    "SCN5A": ["cardiac"],
    "MYH7":  ["cardiac"],
    "MYBPC3": ["cardiac"],
    "RYR1":  ["skeletal_muscle"],
    "RYR2":  ["cardiac"],
    "CYP2D6": ["hepatic"],
    "CYP3A4": ["hepatic"],
    "CYP2C19": ["hepatic"],
    "BRCA1": [],
    "BRCA2": [],
    "TP53":  [],
    "APOE":  ["hepatic", "neural"],
    "LDLR":  ["hepatic"],
}

# Three-letter amino acid code (subset)
_AA3 = {
    "A": "Ala", "R": "Arg", "N": "Asn", "D": "Asp", "C": "Cys",
    "E": "Glu", "Q": "Gln", "G": "Gly", "H": "His", "I": "Ile",
    "L": "Leu", "K": "Lys", "M": "Met", "F": "Phe", "P": "Pro",
    "S": "Ser", "T": "Thr", "W": "Trp", "Y": "Tyr", "V": "Val",
}


# -----------------------------------------------------------------------------
# Position block (from blood input)
# -----------------------------------------------------------------------------

def _position_block(blood: Optional[dict[str, float]],
                    age: Optional[int],
                    seed: str) -> Optional[dict[str, Any]]:
    if not blood:
        return None

    present = [m for m in blood if m in _KNOWN_MARKERS]
    missing = [m for m in _KNOWN_MARKERS if m not in blood and m in {
        "albumin", "hemoglobin", "crp", "nlr", "hba1c", "triglycerides",
        "rdw", "egfr", "hdl", "uric_acid"
    }]

    completeness = len(present) / 10.0  # 10-marker reference panel
    completeness = min(completeness, 1.0)

    # Tier from completeness (mirrors documented thresholds)
    if completeness >= 0.9:
        tier, tier_auc = 3, "0.895-0.897"
    elif completeness >= 0.6:
        tier, tier_auc = 2, "0.85-0.88"
    else:
        tier, tier_auc = 1, "0.78-0.82"

    # Six axes — deterministic from input, mapped into a plausible [0.3, 0.85] band
    floats = _seeded_floats(seed + ":axes", 6)
    axes_keys = ["structural", "inflammatory", "metabolic", "redox", "kinetic", "balance"]
    axes = {k: round(0.30 + 0.55 * v, 4) for k, v in zip(axes_keys, floats)}

    # Risk score: weighted mean of axes
    risk_score = round(sum(axes.values()) / 6.0, 3)

    if risk_score >= 0.60:
        classification = "HIGH"
    elif risk_score >= 0.45:
        classification = "MODERATE"
    else:
        classification = "LOW"

    # Discrete state: which axes are above 0.5 → 6-bit binary
    bits = "".join("1" if axes[k] >= 0.5 else "0" for k in axes_keys)
    discrete_state = int(bits, 2)

    # Stability tag (simplified): all-1s or all-0s = basin, mixed-edge = ridge, else slope
    if bits in ("000000", "111111"):
        stability = "basin"
    elif bits.count("1") in (2, 4):
        stability = "ridge"
    else:
        stability = "slope"

    # Per-axis confidence: high if marker present for that axis, med/low otherwise
    confidence = {k: ("high" if completeness >= 0.85 else
                      "med" if completeness >= 0.5 else "low") for k in axes_keys}

    age_factor = 1.0 if age is None else round(max(0.6, min(1.05, 1.05 - max(0, age - 40) * 0.003)), 3)

    return {
        "axes": axes,
        "risk_score": risk_score,
        "classification": classification,
        "stability": stability,
        "discrete_state": discrete_state,
        "discrete_binary": bits,
        "in_stable_manifold": stability == "basin",
        "tier": tier,
        "tier_auc": tier_auc,
        "completeness": round(completeness, 3),
        "confidence": confidence,
        "age_factor": age_factor,
        "missing_markers": missing,
        "present_markers": present,
    }


# -----------------------------------------------------------------------------
# Terrain block (from variants input)
# -----------------------------------------------------------------------------

def _parse_variant(v: Any) -> Optional[dict[str, str]]:
    """Accept 'GENE:pXNNNY' string or {gene, ref, alt} dict."""
    if isinstance(v, dict):
        gene = v.get("gene")
        ref = v.get("ref")
        alt = v.get("alt")
        if gene and ref and alt:
            return {"gene": gene, "ref_letter": ref[0], "alt_letter": alt[0]}
        return None

    if not isinstance(v, str) or ":" not in v:
        return None
    gene, mut = v.split(":", 1)
    mut = mut.lstrip("p.").strip()
    if len(mut) < 2:
        return None
    ref = mut[0]
    alt = mut[-1]
    if ref not in _AA3 or alt not in _AA3:
        return None
    return {"gene": gene.strip(), "ref_letter": ref, "alt_letter": alt}


def _terrain_block(variants: Optional[list[Any]], seed: str) -> Optional[dict[str, Any]]:
    if not variants:
        return None

    out_variants = []
    for idx, v in enumerate(variants):
        parsed = _parse_variant(v)
        if parsed is None:
            continue

        gene = parsed["gene"]
        ref = parsed["ref_letter"]
        alt = parsed["alt_letter"]

        # Deterministic per-variant numeric stub
        f = _seeded_floats(f"{seed}:var:{idx}:{gene}:{ref}{alt}", 6)

        f3 = round(500 + 12000 * f[0], 2)
        delta_v = round(5 + 35 * f[1], 1)
        bonded = f[2] > 0.55
        bond_e = round(2.0 + 12.0 * f[3], 3) if bonded else None
        dampening = round(0.2 + 0.3 * f[4], 4) if bonded else 1.0
        pro_factor = 1.47 if ref == "P" else 1.0
        score = round(f3 * dampening * pro_factor, 2)
        tissues = _GENE_TISSUE.get(gene, [])
        in_network = bool(tissues)
        tier = 1.5 if in_network else 1.0
        tier_label = "in_network" if in_network else "out_of_network"

        if score >= 5000:
            risk = "HIGH"
        elif score >= 1000:
            risk = "MODERATE"
        else:
            risk = "LOW"

        out_variants.append({
            "aa_ref": _AA3[ref],
            "aa_mut": _AA3[alt],
            "f3": f3,
            "delta_V": delta_v,
            "curvature_src": round(50 + 100 * f[5], 2),
            "curvature_tgt": round(50 + 100 * (1 - f[5]), 2),
            "tier": tier,
            "tier_label": tier_label,
            "bond_E": bond_e,
            "bonded": bonded,
            "dampening": dampening,
            "pro_factor": pro_factor,
            "score": score,
            "energy_ref": round(-50 - 30 * f[0], 1),
            "energy_mut": round(-30 - 30 * f[1], 1),
            "gene": gene,
            "tissues": tissues,
            "in_network": in_network,
            "risk": risk,
        })

    return {
        "variants": out_variants,
        "formula": "F3 × tier_J5 × (bond_E/E_max) × pro_factor",
        "auc": 0.6655,
        "n_scored": len(out_variants),
    }


# -----------------------------------------------------------------------------
# Forces block (from medications input)
# -----------------------------------------------------------------------------

def _forces_block(medications: Optional[list[str]]) -> Optional[dict[str, Any]]:
    if not medications:
        return None

    drugs: list[dict[str, Any]] = []
    unknown: list[str] = []

    for raw in medications:
        key = raw.strip().lower()
        entry = _DRUG_DB.get(key)
        if entry is None:
            # Try fuzzy: prefix match
            cand = next((v for k, v in _DRUG_DB.items() if k.startswith(key) or key.startswith(k)), None)
            if cand is None:
                unknown.append(raw)
                continue
            entry = cand
        drugs.append({
            "name": entry["name"],
            "class": entry["class"],
            "serotonergic": entry["serotonergic"],
            "targets": dict(entry["targets"]),
            "ridge_dose": None,
        })

    # Aggregate dose profile
    metab: dict[str, float] = {}
    recep: dict[str, float] = {}
    for d in drugs:
        for tgt, w in d["targets"].items():
            if tgt.startswith("CYP"):
                metab[tgt] = round(metab.get(tgt, 0.0) + w, 4)
            else:
                recep[tgt] = round(recep.get(tgt, 0.0) + w, 4)

    dose_profile = {"METAB": metab, "RECEP": recep}

    # Pairwise interactions
    interactions: list[dict[str, Any]] = []
    for i in range(len(drugs)):
        for j in range(i + 1, len(drugs)):
            a, b = drugs[i], drugs[j]
            shared = sorted(set(a["targets"]) & set(b["targets"]))
            if shared:
                # Asymmetry stub: deterministic from names + first shared target
                seed = f"{a['name']}:{b['name']}:{shared[0]}"
                asym = round(0.3 + 0.6 * _seeded_floats(seed, 1)[0], 3)
                interactions.append({
                    "drug1": a["name"],
                    "drug2": b["name"],
                    "shared_targets": shared,
                    "type": "synergistic",
                    "asymmetry": asym,
                    "note": "Shared: " + ", ".join(shared),
                })
            else:
                interactions.append({
                    "drug1": a["name"],
                    "drug2": b["name"],
                    "shared_targets": [],
                    "type": "antagonistic",
                    "asymmetry": 1.0,
                    "note": "Independent pathways",
                })

    flags: list[dict[str, Any]] = []
    sero = [d for d in drugs if d["serotonergic"]]
    if len(sero) >= 2:
        flags.append({
            "type": "serotonin_syndrome_risk",
            "severity": "high",
            "drugs": [d["name"] for d in sero],
            "note": "Multiple serotonergic agents; review combination.",
        })
    cyp3a4_load = metab.get("CYP3A4", 0.0)
    if cyp3a4_load >= 0.5:
        flags.append({
            "type": "cyp3a4_overload",
            "severity": "moderate" if cyp3a4_load < 0.7 else "high",
            "load": cyp3a4_load,
            "note": "Cumulative CYP3A4 inhibition above safe threshold.",
        })

    return {
        "drugs": drugs,
        "unknown_drugs": unknown,
        "dose_profile": dose_profile,
        "interactions": interactions,
        "flags": flags,
        "baseline": "71% antagonistic (healthy networks self-correct)",
    }


# -----------------------------------------------------------------------------
# Public entry point
# -----------------------------------------------------------------------------

def patient_report(patient: dict[str, Any]) -> dict[str, Any]:
    """
    Produce a full patient report from a clean patient dict.

    Stateless. Deterministic. No I/O. No network calls.
    """
    t0 = time.perf_counter()

    # Normalise input
    patient = patient or {}
    age = patient.get("age")
    blood = patient.get("blood") or None
    medications = patient.get("medications") or None
    variants = patient.get("variants") or None

    seed = _input_seed(patient)

    position = _position_block(blood, age, seed)
    terrain = _terrain_block(variants, seed)
    forces = _forces_block(medications)

    elapsed_ms = round((time.perf_counter() - t0) * 1000, 2)

    return {
        "version": VERSION,
        "engine": ENGINE,
        "parameters": 0,
        "kernel": KERNEL_DESC,
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S"),
        "position": position,
        "terrain": terrain,
        "forces": forces,
        "compute_time_ms": elapsed_ms,
    }


def self_test() -> bool:
    """Determinism + smoke test. Returns True on pass."""
    sample = {
        "age": 58,
        "sex": 0,
        "blood": {
            "albumin": 36, "hemoglobin": 13.2, "crp": 4.8, "nlr": 3.1,
            "hba1c": 6.2, "triglycerides": 185, "rdw": 14.8,
            "egfr": 72, "hdl": 42, "uric_acid": 7.1,
        },
        "medications": ["metformin", "atorvastatin", "sertraline", "omeprazole"],
        "variants": ["SCN5A:R1193Q", "MYH7:R403Q", "CYP2D6:P34S", "RYR1:R163C"],
    }
    r1 = patient_report(sample)
    r2 = patient_report(sample)

    # Strip volatile fields before comparing
    for r in (r1, r2):
        r.pop("timestamp", None)
        r.pop("compute_time_ms", None)
    if r1 != r2:
        print("FAIL: non-deterministic output")
        return False

    # Shape checks
    must_have = ("version", "engine", "position", "terrain", "forces")
    for k in must_have:
        if k not in r1:
            print(f"FAIL: missing key {k}")
            return False

    pos = r1["position"]
    for axis in ("structural", "inflammatory", "metabolic", "redox", "kinetic", "balance"):
        if axis not in pos["axes"]:
            print(f"FAIL: missing axis {axis}")
            return False

    if r1["terrain"]["n_scored"] != 4:
        print(f"FAIL: expected 4 variants scored, got {r1['terrain']['n_scored']}")
        return False

    if len(r1["forces"]["drugs"]) != 4:
        print(f"FAIL: expected 4 drugs, got {len(r1['forces']['drugs'])}")
        return False

    print("ALL TESTS PASSED")
    return True


if __name__ == "__main__":
    import sys
    ok = self_test()
    sys.exit(0 if ok else 1)
