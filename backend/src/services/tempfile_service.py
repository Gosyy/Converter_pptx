from pathlib import Path
import uuid

from fastapi import HTTPException

from src.schemas.tempfile_schemas import TempfileInfoSchema
from src.config import settings


class _TempfileService:
    _tempfile_dir: Path
    _cleanup_interval: int
    _files_registry: dict[str, TempfileInfoSchema]

    def __init__(self, tempfile_dir: Path, cleanup_interval: int) -> None:
        self._tempfile_dir = tempfile_dir
        self._cleanup_interval = cleanup_interval
        self._files_registry = {}

        self._tempfile_dir.mkdir(exist_ok=True)

    # async def cleanup_old_files(self) -> None:
    #     while True:
    #         now = dt.datetime.now()
    #         expired_files = [
    #             file_id
    #             for file_id, file_info in self._files_registry.items()
    #             if file_info.is_expired(now)
    #         ]

    #         for file_id in expired_files:
    #             file_path = self._tempfile_dir / file_id
    #             try:
    #                 if file_path.exists():
    #                     os.unlink(file_path)
    #                 del self._files_registry[file_id]

    #                 print(f"Удален временный файл: {file_id}")
    #             except Exception as e:
    #                 print(f"Tempfile error: {e}")

    #         await asyncio.sleep()

    def save_file(self, content: bytes, file_ext: str) -> str:
        filename = f"{uuid.uuid4()}.{file_ext}"

        with open(self._tempfile_dir / filename, "wb") as f:
            f.write(content)

        return filename

    def get_file(self, filename: str) -> Path:
        file_path = self._tempfile_dir / filename

        if not file_path.exists():
            raise HTTPException(404, "Файл не найден")

        return file_path


tempfile_service = _TempfileService(
    settings.TEMPFILE_DIR, settings.TEMPFILE_CLEANUP_INTERVAL_SECONDS
)
