from typing import Annotated

from fastapi import APIRouter, Response, File, UploadFile

from src.services import convert_file_service

router = APIRouter()


@router.post("/parse_file", status_code=200)
async def send_message(file: Annotated[UploadFile, File()]) -> Response:
    md_text = await convert_file_service.convert_file(file)

    return Response(content=md_text, media_type="text/markdown")
