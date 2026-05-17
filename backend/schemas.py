"""
HexaGene API — input / output schema (Pydantic v2).

Matches §4.2 (engine input) and §5 (engine output) of the Backend & Hosting Overview.
Validation is permissive: unknown blood markers are allowed (engine may extend),
unknown drugs and unparseable variants are surfaced in the response, not rejected.
"""

from __future__ import annotations

from typing import Any, Optional, Union

from pydantic import BaseModel, Field, field_validator


# -----------------------------------------------------------------------------
# Inputs
# -----------------------------------------------------------------------------

class VariantObject(BaseModel):
    gene: str
    ref: str
    alt: str
    position: Optional[int] = None


class PatientInput(BaseModel):
    """The clean engine-ready patient document. All fields optional."""

    age: Optional[int] = Field(default=None, ge=0, le=120)
    sex: Optional[int] = Field(default=None, ge=0, le=1)
    blood: Optional[dict[str, float]] = None
    medications: Optional[list[str]] = None
    variants: Optional[list[Union[str, VariantObject]]] = None
    vitals: Optional[dict[str, Any]] = None

    @field_validator("blood")
    @classmethod
    def _blood_numeric(cls, v: Optional[dict[str, Any]]) -> Optional[dict[str, float]]:
        if v is None:
            return None
        out: dict[str, float] = {}
        for k, val in v.items():
            try:
                out[k] = float(val)
            except (TypeError, ValueError):
                raise ValueError(f"blood marker '{k}' must be numeric (got {val!r})")
        return out

    @field_validator("medications")
    @classmethod
    def _meds_size(cls, v: Optional[list[str]]) -> Optional[list[str]]:
        if v is not None and len(v) > 50:
            raise ValueError("medications: max 50 per request")
        return v

    @field_validator("variants")
    @classmethod
    def _variants_size(cls, v):
        if v is not None and len(v) > 1000:
            raise ValueError("variants: max 1000 per request")
        return v


# -----------------------------------------------------------------------------
# Intake (mixed real-world inputs)
# -----------------------------------------------------------------------------

class IntakeInput(BaseModel):
    raw_23andme: Optional[str] = None
    medications: Optional[list[str]] = None
    labs: Optional[dict[str, Union[float, str]]] = None
    demographics: Optional[dict[str, Any]] = None


class IntakeResponse(BaseModel):
    patient: PatientInput
    review_needed: list[dict[str, Any]] = Field(default_factory=list)


# -----------------------------------------------------------------------------
# Outputs are returned as plain dict[str, Any] to keep field-forward compatibility
# (per §10: "If a field is not understood by the backend, it should still be
# forwarded.") We don't pin every numeric output into a strict model.
# -----------------------------------------------------------------------------

class HealthResponse(BaseModel):
    status: str = "ok"
    version: str


class VersionResponse(BaseModel):
    version: str
    engine: str
    kernel: str
    build: str
    mode: str  # "demo" | "production"
