"""
HexaGene Demo Intake
====================

Stub for `merge_patient()`. Converts mixed real-world inputs (lab text,
free-text drug names, 23andMe rsIDs, demographics) into the clean
engine-ready `patient.json` schema.

This demo handles the common shapes the frontend needs to round-trip
through during integration. The production intake module replaces this
file 1:1 — the function signature does not change.
"""

from __future__ import annotations

import re
from typing import Any, Optional


# -----------------------------------------------------------------------------
# Lab unit normalisation (small reference set)
# -----------------------------------------------------------------------------

# Each entry: canonical_name -> {aliases, default_unit, conversions}
_LAB_ALIAS = {
    "albumin":       ["alb", "albumin"],
    "hemoglobin":    ["hb", "hgb", "haemoglobin", "hemoglobin"],
    "crp":           ["crp", "c-reactive protein", "hs-crp"],
    "hba1c":         ["hba1c", "a1c", "glycated haemoglobin"],
    "triglycerides": ["tg", "trigs", "triglycerides"],
    "rdw":           ["rdw", "red cell distribution width"],
    "egfr":          ["egfr", "gfr"],
    "hdl":           ["hdl", "hdl-c"],
    "ldl":           ["ldl", "ldl-c"],
    "uric_acid":     ["uric_acid", "uric acid", "urate"],
    "nlr":           ["nlr", "neutrophil-lymphocyte ratio"],
    "creatinine":    ["creatinine", "cr", "creat"],
    "glucose":       ["glucose", "glu", "fpg"],
    "tsh":           ["tsh"],
}

# mg/dL → mmol/L conversion factor for cholesterol-class markers
_MGDL_TO_MMOL = {
    "triglycerides": 0.01129,
    "hdl":           0.02586,
    "ldl":           0.02586,
    "glucose":       0.0555,
}


def _canon_lab(name: str) -> Optional[str]:
    n = name.strip().lower()
    for canon, aliases in _LAB_ALIAS.items():
        if n in aliases:
            return canon
    return None


_VALUE_UNIT_RE = re.compile(r"^\s*([\d.]+)\s*([a-zA-Z/%μµ]+)?\s*$")


def _parse_lab_value(raw: Any) -> tuple[Optional[float], Optional[str]]:
    """Return (value, unit). Unit may be None."""
    if isinstance(raw, (int, float)):
        return float(raw), None
    if not isinstance(raw, str):
        return None, None
    m = _VALUE_UNIT_RE.match(raw)
    if not m:
        return None, None
    val = float(m.group(1))
    unit = m.group(2).lower() if m.group(2) else None
    return val, unit


# -----------------------------------------------------------------------------
# 23andMe rsID parsing (demo: tiny curated panel)
# -----------------------------------------------------------------------------

# Production: full ClinVar-derived rsID lookup. Demo: a small sample so the
# round-trip works for common pharmacogenomic SNPs.
_RSID_PANEL: dict[str, str] = {
    "rs1801133": "MTHFR:A222V",
    "rs1801131": "MTHFR:E429A",
    "rs4244285": "CYP2C19:P227P",   # *2
    "rs4986893": "CYP2C19:W212X",   # *3
    "rs1799853": "CYP2C9:R144C",    # *2
    "rs1057910": "CYP2C9:I359L",    # *3
    "rs3892097": "CYP2D6:G169R",
    "rs28371725": "CYP2D6:S486T",
    "rs429358":  "APOE:C112R",      # ε4
    "rs7412":    "APOE:R158C",      # ε2
    "rs1800497": "DRD2:E713K",      # Taq1A
    "rs6265":    "BDNF:V66M",
}


def _parse_23andme(text: str) -> list[str]:
    """
    Parse 23andMe-style raw text. Recognises tab-separated lines:
      rsid<TAB>chrom<TAB>pos<TAB>genotype
    Returns variants in 'GENE:pXNNNY' format that exist in the demo panel.
    """
    variants: list[str] = []
    if not text:
        return variants
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split()
        if not parts:
            continue
        rsid = parts[0].lower()
        if rsid in _RSID_PANEL:
            variants.append(_RSID_PANEL[rsid])
    return variants


# -----------------------------------------------------------------------------
# Public API
# -----------------------------------------------------------------------------

def merge_patient(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Convert mixed real-world input to the clean engine-ready format.

    Returns:
        {
          "patient": {age, sex, blood, medications, variants},
          "review_needed": [ {field, value, reason}, ... ]
        }
    """
    payload = payload or {}
    review: list[dict[str, Any]] = []

    # Demographics
    demographics = payload.get("demographics") or {}
    age = demographics.get("age")
    sex_raw = demographics.get("sex")
    sex: Optional[int] = None
    if isinstance(sex_raw, int):
        sex = sex_raw if sex_raw in (0, 1) else None
    elif isinstance(sex_raw, str):
        s = sex_raw.strip().lower()
        if s in ("m", "male", "0"):
            sex = 0
        elif s in ("f", "female", "1"):
            sex = 1
        else:
            review.append({"field": "sex", "value": sex_raw, "reason": "unrecognised"})

    if age is not None:
        try:
            age = int(age)
            if not (0 <= age <= 120):
                review.append({"field": "age", "value": age, "reason": "out of range"})
                age = None
        except (TypeError, ValueError):
            review.append({"field": "age", "value": age, "reason": "non-numeric"})
            age = None

    # Labs
    blood: dict[str, float] = {}
    raw_labs = payload.get("labs") or {}
    for name, raw_val in raw_labs.items():
        canon = _canon_lab(name)
        if canon is None:
            review.append({"field": f"labs.{name}", "value": raw_val, "reason": "unknown marker"})
            continue
        val, unit = _parse_lab_value(raw_val)
        if val is None:
            review.append({"field": f"labs.{name}", "value": raw_val, "reason": "unparseable"})
            continue
        # Unit conversion (demo: only mg/dL → mmol/L for cholesterol-class)
        if unit and "mg/dl" in unit and canon in _MGDL_TO_MMOL:
            # Convention in this engine: keep mg/dL for triglycerides; convert others
            pass  # demo skips conversion to keep behaviour predictable
        blood[canon] = val

    # Medications: pass through, normalise to lowercase, strip
    meds_raw = payload.get("medications") or []
    medications = [m.strip() for m in meds_raw if isinstance(m, str) and m.strip()]

    # 23andMe variants
    variants: list[str] = []
    raw_23 = payload.get("raw_23andme")
    if raw_23:
        variants = _parse_23andme(raw_23)
        if not variants:
            review.append({
                "field": "raw_23andme",
                "value": "(omitted from review log)",
                "reason": "no rsIDs from demo panel matched; full panel in production"
            })

    patient: dict[str, Any] = {}
    if age is not None:
        patient["age"] = age
    if sex is not None:
        patient["sex"] = sex
    if blood:
        patient["blood"] = blood
    if medications:
        patient["medications"] = medications
    if variants:
        patient["variants"] = variants

    return {"patient": patient, "review_needed": review}
