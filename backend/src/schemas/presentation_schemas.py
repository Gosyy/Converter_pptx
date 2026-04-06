from __future__ import annotations
from typing import Annotated

from pydantic import BaseModel, model_validator, Field

from src.config import ModelAction, settings
from src.schemas.model_schemas import SlideItem


class _BaseModelReqSchema(BaseModel):
    model: str = ""

    @model_validator(mode="after")
    def normalize_model(self):
        if self.model not in settings.DEFAULT_MODEL_VALUES:
            self.model = settings.DEFAULT_MODEL
        return self


class GeneratePresInSchema(_BaseModelReqSchema):
    text: Annotated[str, Field(min_length=1)]


class EditSlideInSchema(_BaseModelReqSchema):
    text: str = ""
    action: ModelAction
    slide: SlideItem

    @model_validator(mode="after")
    def validate_custom_prompt(self):
        if (self.action == ModelAction.CUSTOM) and not self.text.strip():
            raise ValueError("При кастомном запросе промпт не может быть пустым!")

        return self


EditSlideInSchema.model_rebuild()
