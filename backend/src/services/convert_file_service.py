import os
import tempfile

from fastapi import UploadFile, HTTPException

from src.utils import file_utils
from src.modules.parsers.documents_parser import markdown_parser
from src.services.rust_sidecar_client import parse_document


def convert_uploaded_file_sync(filename: str, content: bytes) -> str:
    file_ext = file_utils.get_file_ext(filename)

    if file_ext not in markdown_parser.allowed_formats:
        raise HTTPException(status_code=400, detail="Неподдерживаемый формат")

    rust_markdown = parse_document(filename or "document", content)
    if rust_markdown:
        return rust_markdown

    tmp_file_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_ext}") as tmp_file:
            tmp_file.write(content)
            tmp_file.flush()
            tmp_file_path = tmp_file.name

        return markdown_parser.parse(tmp_file_path)
    finally:
        if tmp_file_path and os.path.exists(tmp_file_path):
            os.unlink(tmp_file_path)


async def convert_file(file: UploadFile) -> str:
    content = await file.read()
    return convert_uploaded_file_sync(file.filename or "document", content)
