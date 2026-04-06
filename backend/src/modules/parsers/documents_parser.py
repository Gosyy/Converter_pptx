from __future__ import annotations
from typing import Callable

import docx2md
import pandas as pd

import pymupdf4llm

from src.utils import file_utils
from src.modules.parsers.abstract_parser import AbstractParser
from src.modules.parsers.pptx_parser import PPTXToMDParser
from src.modules.parsers.docx_parser import DocxToMDParser
from src.modules.parsers.pdf_parser import PDFToMDParser


class _MDParser(AbstractParser):
    _pptx_parser: PPTXToMDParser
    _docx_parser: DocxToMDParser
    _pdf_parser: PDFToMDParser

    def __init__(self):
        self._pptx_parser = PPTXToMDParser()
        self._docx_parser = DocxToMDParser()
        self._pdf_parser = PDFToMDParser()

        self._FORMAT_TO_FUNC: dict[str, Callable[..., str]] = {
            "pdf": self._pdf_parser.parse,
            "doc": self._docx_parser.parse,
            "docx": self._docx_parser.parse,
            "csv": self._parse_from_csv,
            "tsv": self._parse_from_csv,
            "xlsx": self._parse_from_xlsx,
            "pptx": self._pptx_parser.parse,
        }

    def parse(self, filename: str, *args, **kwars) -> str:
        ext = file_utils.get_file_ext(filename)
        func = self._FORMAT_TO_FUNC[ext]

        return func(filename, *args, **kwars)

    def _parse_from_pdf(self, filename: str) -> str:
        md = pymupdf4llm.to_markdown(filename)

        return self._preprocess_md(md)

    def _parse_from_doc(self, filename: str) -> str:
        md = docx2md.do_convert(filename, use_md_table=True)

        return self._preprocess_md(md)

    def _parse_from_csv(self, filename: str, sep: str = ",") -> str:
        md = pd.read_csv(filename, sep=sep).to_markdown()

        return self._preprocess_md(md)

    def _parse_from_xlsx(self, filename: str) -> str:
        md = pd.read_excel(filename).to_markdown()

        return self._preprocess_md(md)

    def _parse_from_pptx(self, filename: str) -> str:
        return self._pptx_parser.parse(filename)

    @property
    def allowed_formats(self) -> tuple[str, ...]:
        return tuple(self._FORMAT_TO_FUNC.keys())


markdown_parser = _MDParser()
