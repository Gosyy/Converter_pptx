import fitz
from fitz import Page as fPage
import pdfplumber
from pdfplumber.page import Page as plPage
from typing import Callable

from src.modules.parsers.abstract_parser import AbstractParser


class PDFToMDParser(AbstractParser):
    def __init__(self, save_image_func: Callable[[bytes], str]):
        self.save_image_func = save_image_func

    def parse(self, pdf_path: str) -> str:
        pdf_document = fitz.open(pdf_path)
        markdown_pages = []

        with pdfplumber.open(pdf_path) as pdf_plumber:
            for page_num in range(len(pdf_document)):
                page_content = self._parse_page_advanced(
                    pdf_document[page_num], pdf_plumber.pages[page_num], page_num
                )
                if page_content.strip():
                    markdown_pages.append(page_content)

        pdf_document.close()

        return "\n\n---\n\n".join(markdown_pages)

    def _parse_page_advanced(
        self, fitz_page: fPage, plumber_page: plPage, page_num: int
    ) -> str:
        result = []

        tables_data = self._extract_tables_with_bbox(plumber_page)
        images = self._extract_images(fitz_page, page_num)

        # Извлекаем текст
        text = fitz_page.get_text("text")

        # Добавляем текст
        if text.strip():
            # Очищаем текст от лишних пробелов
            cleaned_text = self._clean_text(text)
            result.append(cleaned_text)

        # Добавляем таблицы
        for table_md in tables_data:
            result.append(table_md)

        # Добавляем изображения
        for img_path in images:
            result.append(f"![Image]({img_path})\n")

        return "\n\n".join(result)

    def _extract_tables_with_bbox(self, page: plPage) -> list[str]:
        tables_md = []
        tables = page.extract_tables()

        for table in tables:
            if table and len(table) > 0:
                md_table = self._table_to_markdown(table)
                if md_table:
                    tables_md.append(md_table)

        return tables_md

    def _extract_images(self, page: fPage) -> list[str]:
        image_paths = []
        image_list = page.get_images()

        for img in image_list:
            try:
                xref = img[0]
                base_image = page.parent.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]

                if len(image_bytes) <= 1000:
                    continue

                image_paths.append(self._image_to_md(image_bytes, image_ext))
            except Exception as e:
                print(f"Ошибка при извлечении изображения: {e}")

        return image_paths

    def _table_to_markdown(self, table: list[list[str | None]]) -> str:
        if not table or len(table) == 0:
            return ""

        clean_table: list[list[str]] = []
        for row in table:
            clean_row = [str(cell).strip() if cell else "" for cell in row]
            clean_table.append(clean_row)

        if not clean_table:
            return ""

        md_lines = []
        num_cols = max(len(row) for row in clean_table)
        for row in clean_table:
            while len(row) < num_cols:
                row.append("")

        header = clean_table[0]
        md_lines.append("| " + " | ".join(header) + " |")
        md_lines.append("| " + " | ".join(["---"] * num_cols) + " |")

        for row in clean_table[1:]:
            md_lines.append("| " + " | ".join(row) + " |")

        return "\n".join(md_lines)

    def _clean_text(self, text: str) -> str:
        """Очищает текст от лишних символов"""
        # Убираем множественные пустые строки
        lines = text.split("\n")
        cleaned_lines = []

        for line in lines:
            stripped = line.strip()
            if stripped:
                cleaned_lines.append(stripped)

        return "\n\n".join(cleaned_lines)
