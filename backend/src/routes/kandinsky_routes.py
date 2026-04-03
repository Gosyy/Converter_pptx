from fastapi import APIRouter, HTTPException

from src.config import settings
from src.schemas.kandinsky_schemas import (
    KandinskyGenerateIn,
    KandinskyGenerateOut,
    KandinskyStyleTransferIn,
    KandinskyStyleTransferOut,
)
from src.services.kandinsky_service import KandinskyService

router = APIRouter(prefix="/kandinsky", tags=["Kandinsky"])
service = KandinskyService()


@router.post("/v1/generate-image", response_model=KandinskyGenerateOut)
def generate_image(body: KandinskyGenerateIn):
    if not settings.FEATURE_KANDINSKY:
        raise HTTPException(status_code=404, detail="Kandinsky feature is disabled")
    try:
        result = service.image_generation(prompt=body.prompt, style=body.style)
        return {
            "provider": result.get("provider", "unknown"),
            "image_url": result.get("image_url"),
            "raw": result,
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Kandinsky error: {e}")


@router.post("/v1/style-transfer", response_model=KandinskyStyleTransferOut)
def style_transfer(body: KandinskyStyleTransferIn):
    if not settings.FEATURE_KANDINSKY:
        raise HTTPException(status_code=404, detail="Kandinsky feature is disabled")
    try:
        result = service.style_transfer(
            markdown=body.markdown,
            template_id=body.template_id,
            template_image_url=body.template_image_url,
        )
        return {
            "provider": result.get("provider", "unknown"),
            "transformed_markdown": result.get("transformed_markdown"),
            "raw": result,
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Kandinsky error: {e}")
