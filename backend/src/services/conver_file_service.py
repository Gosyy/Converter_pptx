import os
import tempfile

from fastapi import UploadFile, HTTPException

from src.utils import file_utils
from src.modules.parsers.documents_parser import markdown_parser


async def convert_file(file: UploadFile) -> str:
    file_ext = file_utils.get_file_ext(file.filename)

    if file_ext not in markdown_parser.allowed_formats:
        raise HTTPException(status_code=400, detail="Неподдерживаемый формат")

    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_ext}") as tmp_file:
        content = await file.read()
        tmp_file.write(content)
        tmp_file.flush()
        tmp_file_path = tmp_file.name

    try:
        md_text = markdown_parser.parse(tmp_file_path)
    finally:
        os.unlink(tmp_file_path)

    return md_text
