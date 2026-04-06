from pydantic import BaseModel, Field

API_VERSION = "v1"


class KandinskyBaseResponse(BaseModel):
    api_version: str = Field(default=API_VERSION)
    provider: str


class KandinskyGenerateIn(BaseModel):
    prompt: str
    style: str | None = None


class KandinskyGenerateOut(KandinskyBaseResponse):
    image_url: str | None = None
    raw: dict


class KandinskyStyleTransferIn(BaseModel):
    markdown: str
    template_id: str | None = None
    template_image_url: str | None = None


class KandinskyStyleTransferOut(KandinskyBaseResponse):
    transformed_markdown: str | None = None
    raw: dict
