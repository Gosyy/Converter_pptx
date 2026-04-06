import time
import uuid
from pathlib import Path

from fastapi import HTTPException

from src.config import settings
from src.schemas.tempfile_schemas import TempfileInfoSchema


class _TempfileService:
    _tempfile_dir: Path
    _cleanup_interval: int
    _files_registry: dict[str, TempfileInfoSchema]

    def __init__(self, tempfile_dir: Path, cleanup_interval: int) -> None:
        self._tempfile_dir = tempfile_dir
        self._cleanup_interval = cleanup_interval
        self._files_registry = {}

        self._tempfile_dir.mkdir(exist_ok=True)

    def cleanup_old_files(self) -> None:
        now = time.time()
        for path in self._tempfile_dir.glob("*"):
            try:
                if path.is_file() and (now - path.stat().st_mtime) > self._cleanup_interval:
                    path.unlink(missing_ok=True)
            except Exception:
                pass

    def save_file(self, content: bytes, file_ext: str) -> str:
        filename = f"{uuid.uuid4()}.{file_ext}"

        with open(self._tempfile_dir / filename, "wb") as f:
            f.write(content)

        return filename

    def get_file(self, filename: str) -> Path:
        safe_name = Path(filename).name
        file_path = (self._tempfile_dir / safe_name).resolve()
        root = self._tempfile_dir.resolve()

        if root not in file_path.parents and file_path != root:
            raise HTTPException(400, "Некорректное имя файла")

        if not file_path.exists():
            raise HTTPException(404, "Файл не найден")

        return file_path


tempfile_service = _TempfileService(
    settings.TEMPFILE_DIR, settings.TEMPFILE_CLEANUP_INTERVAL_SECONDS
)
