"""
HexaGene Demo Clinical Report
=============================

Stub for `generate_clinical_report()`. Takes the raw engine output and adds:
  - coverage analysis (which projections fired, what's missing)
  - cross-projection integration (e.g. drug × variant CYP overlap)
  - prioritised action items
  - plain-language summary block

Same input → same output. No I/O. Append-only (existing fields untouched).
"""

from __future__ import annotations

from typing import Any, Optional


def _coverage(report: dict[str, Any]) -> dict[str, Any]:
    has_pos = report.get("position") is not None
    has_ter = report.get("terrain") is not None
    has_for = report.get("forces") is not None

    fired = [name for name, ok in (("position", has_pos),
                                   ("terrain", has_ter),
                                   ("forces", has_for)) if ok]
    missing = [name for name, ok in (("position", has_pos),
                                     ("terrain", has_ter),
                                     ("forces", has_for)) if not ok]

    completeness = len(fired) / 3.0
    if completeness == 1.0:
        level = "complete"
    elif completeness >= 0.66:
        level = "partial"
    else:
        level = "limited"

    notes: list[str] = []
    if not has_pos:
        notes.append("No blood markers provided — biomarker projection unavailable.")
    if not has_ter:
        notes.append("No variants provided — genetic terrain projection unavailable.")
    if not has_for:
        notes.append("No medications provided — drug-force projection unavailable.")

    return {
        "level": level,
        "fired_projections": fired,
        "missing_projections": missing,
        "completeness": round(completeness, 3),
        "notes": notes,
    }


def _cross_integration(report: dict[str, Any]) -> list[dict[str, Any]]:
    """Surface where projections overlap meaningfully."""
    out: list[dict[str, Any]] = []
    terrain = report.get("terrain") or {}
    forces = report.get("forces") or {}

    # CYP variants × CYP-targeting drugs
    cyp_variants = [v for v in terrain.get("variants", [])
                    if v.get("gene", "").startswith("CYP") and v.get("score", 0) > 500]
    if cyp_variants and forces.get("drugs"):
        for v in cyp_variants:
            gene = v["gene"]
            affected_drugs = [d["name"] for d in forces["drugs"]
                              if gene in (d.get("targets") or {})]
            if affected_drugs:
                out.append({
                    "type": "pharmacogenomic_overlap",
                    "gene": gene,
                    "variant_score": v["score"],
                    "variant_risk": v["risk"],
                    "affected_drugs": affected_drugs,
                    "note": f"Variant in {gene} may modify metabolism of: " + ", ".join(affected_drugs),
                })

    # High-risk tissue variants × biomarker axis stress
    position = report.get("position") or {}
    axes = position.get("axes") or {}
    high_risk_variants = [v for v in terrain.get("variants", [])
                          if v.get("risk") == "HIGH"]
    if high_risk_variants and axes:
        # Map tissues to biomarker axes (simplified for demo)
        tissue_axis = {"cardiac": "structural", "skeletal_muscle": "kinetic",
                       "hepatic": "metabolic"}
        for v in high_risk_variants:
            for tissue in (v.get("tissues") or []):
                axis = tissue_axis.get(tissue)
                if axis and axes.get(axis, 0) >= 0.6:
                    out.append({
                        "type": "tissue_axis_concordance",
                        "gene": v["gene"],
                        "tissue": tissue,
                        "axis": axis,
                        "axis_value": axes[axis],
                        "variant_risk": v["risk"],
                        "note": f"High-risk {v['gene']} variant in {tissue} tissue, "
                                f"{axis} axis stressed ({axes[axis]}).",
                    })

    return out


def _action_items(report: dict[str, Any], integration: list[dict[str, Any]]) -> list[dict[str, Any]]:
    actions: list[dict[str, Any]] = []

    forces = report.get("forces") or {}
    for flag in forces.get("flags", []):
        actions.append({
            "priority": "high" if flag.get("severity") == "high" else "moderate",
            "category": "pharmacology",
            "subject": flag.get("type"),
            "detail": flag.get("note"),
        })

    for item in integration:
        if item["type"] == "pharmacogenomic_overlap":
            actions.append({
                "priority": "high" if item["variant_risk"] == "HIGH" else "moderate",
                "category": "pharmacogenomic",
                "subject": item["gene"],
                "detail": item["note"],
            })
        elif item["type"] == "tissue_axis_concordance":
            actions.append({
                "priority": "moderate",
                "category": "monitoring",
                "subject": f"{item['gene']} ({item['tissue']})",
                "detail": item["note"],
            })

    position = report.get("position") or {}
    if position.get("classification") == "HIGH":
        actions.append({
            "priority": "high",
            "category": "biomarker",
            "subject": "elevated risk score",
            "detail": f"Composite biomarker risk score {position.get('risk_score')} "
                      f"({position.get('classification')}). Tier {position.get('tier')}, "
                      f"stability '{position.get('stability')}'.",
        })

    # Order by priority
    pri = {"high": 0, "moderate": 1, "low": 2}
    actions.sort(key=lambda a: pri.get(a.get("priority", "low"), 99))
    return actions


def _summary(report: dict[str, Any], coverage: dict[str, Any],
             actions: list[dict[str, Any]]) -> dict[str, str]:
    lines: list[str] = []
    position = report.get("position")
    terrain = report.get("terrain")
    forces = report.get("forces")

    if position:
        lines.append(
            f"Position: composite risk {position['risk_score']} ({position['classification']}), "
            f"state {position['discrete_state']} ({position['stability']}), "
            f"tier {position['tier']}, completeness {position['completeness']}."
        )
    if terrain:
        n = terrain["n_scored"]
        n_high = sum(1 for v in terrain["variants"] if v["risk"] == "HIGH")
        n_mod = sum(1 for v in terrain["variants"] if v["risk"] == "MODERATE")
        lines.append(f"Terrain: {n} variants scored — {n_high} HIGH, {n_mod} MODERATE.")
    if forces:
        nd = len(forces["drugs"])
        ni = len(forces["interactions"])
        nf = len(forces.get("flags", []))
        lines.append(f"Forces: {nd} drugs, {ni} pairwise interactions, {nf} flags.")

    if actions:
        n_high = sum(1 for a in actions if a["priority"] == "high")
        lines.append(f"{len(actions)} action items ({n_high} high priority).")
    else:
        lines.append("No prioritised action items.")

    return {
        "headline": " ".join(lines[:1]) if lines else "No projections produced.",
        "body": " ".join(lines),
        "coverage_level": coverage["level"],
    }


def generate_clinical_report(engine_output: dict[str, Any]) -> dict[str, Any]:
    """
    Take raw engine output, return enriched report.

    Adds a top-level 'clinical' block. Existing keys are not modified.
    """
    if not isinstance(engine_output, dict):
        raise TypeError("engine_output must be a dict")

    coverage = _coverage(engine_output)
    integration = _cross_integration(engine_output)
    actions = _action_items(engine_output, integration)
    summary = _summary(engine_output, coverage, actions)

    enriched = dict(engine_output)  # shallow copy; preserves all existing fields
    enriched["clinical"] = {
        "coverage": coverage,
        "integration": integration,
        "action_items": actions,
        "summary": summary,
    }
    return enriched
