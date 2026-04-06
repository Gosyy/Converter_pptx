from fastapi import APIRouter, Response
from fastapi.responses import FileResponse

from src.services.tempfile_service import tempfile_service

router = APIRouter()


@router.get("/files/{filename}", status_code=200)
async def get_file(filename: str) -> Response:
    file_path = tempfile_service.get_file(filename)

    return FileResponse(path=file_path)
