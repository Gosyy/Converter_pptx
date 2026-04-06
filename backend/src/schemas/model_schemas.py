from typing import Annotated, Any

from pydantic import BaseModel, Field, field_validator, model_validator

from src.config import model_settings


class ClassifierOut(BaseModel):
    label: str
    confidence: float
    rationale: str
    suggested_actions: list[str]

    @field_validator("label")
    @classmethod
    def check_label(cls, v: str) -> str:
        allowed = {"TopManagement", "Experts", "Investors"}
        if v not in allowed:
            raise ValueError(f"label must be one of {allowed}")
        return v

    @field_validator("confidence")
    @classmethod
    def check_confidence(cls, v: Any) -> float:
        fv = float(v)
        if not (0.0 <= fv <= 1.0):
            raise ValueError("confidence out of range 0.0-1.0")
        return fv


class SlideStructure(BaseModel):
    """Schema for planner output - just structure without content"""
    slide_id: Annotated[int, Field(ge=1)]
    title: str = ""
    task: str = ""


class SlideItem(BaseModel):
    """Schema for final slides with content"""
    slide_id: Annotated[int, Field(ge=1)]
    title: str = ""
    content: Annotated[str, Field(min_length=1)]


class StructureOut(BaseModel):
    """Output from planner - just structure"""
    slides: Annotated[
        list[SlideStructure],
        Field(
            ...,
            min_length=model_settings.MIN_SLIDES,
            max_length=model_settings.MAX_SLIDES,
        ),
    ]

    @model_validator(mode="after")
    @classmethod
    def check_seq(cls, m):
        for i, s in enumerate(m.slides, start=1):
            if s.slide_id != i:
                raise ValueError(
                    f"slide_id must be sequential starting at 1 (expected {i}, got {s.slide_id})"
                )
        return m
