from abc import ABC, abstractmethod
import re

from src.services.tempfile_service import tempfile_service


class AbstractParser(ABC):

    @abstractmethod
    def parse(self, filename: str, *args, **kwars) -> str:
        pass

    def _preprocess_md(self, md_text: str) -> str:
        md_text = re.sub(r"(\w+)-\n(\w+)", r"\1\2", md_text)
        md_text = re.sub(r" +", " ", md_text)
        md_text = re.sub(r"\n{3,}", "\n\n", md_text)
        md_text = re.sub(r" +\n", "\n", md_text)

        return md_text.strip()

    def _image_to_md(self, content: bytes, ext: str, alt: str = "") -> str:
        image_path = tempfile_service.save_file(content, ext)
        return f"![{alt}](/files/{image_path})"
