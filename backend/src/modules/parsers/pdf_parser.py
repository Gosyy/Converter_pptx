from typing import Any
from io import BytesIO
import re
from collections import defaultdict

import pdfplumber
from pdfplumber.page import Page

from src.modules.parsers.abstract_parser import AbstractParser


class PDFToMDParser(AbstractParser):

    def parse(self, filename: str, *args, **kwargs) -> str:
        pages_markdown = []

        with pdfplumber.open(filename) as pdf:
            for page in pdf.pages:
                page_md = self._process_page(page)

                if page_md.strip():
                    pages_markdown.append(page_md)

        return "\n\n---\n\n".join(pages_markdown)

    def _process_page(self, page: Page) -> str:
        text_blocks = self._extract_structured_text(page)
        tables_info, used_images = self._process_tables_with_images(page)
        standalone_images = self._process_standalone_images(
            page, tables_info, used_images
        )

        return self._merge_page_elements(text_blocks, tables_info, standalone_images)

    def _extract_structured_text(self, page: Page) -> list[dict[str, Any]]:
        words = page.extract_words(
            x_tolerance=3,
            y_tolerance=3,
            keep_blank_chars=False,
            use_text_flow=True,
        )

        if not words:
            return []

        lines = self._group_words_into_lines(words)

        font_sizes = [line["font_size"] for line in lines if line["font_size"]]
        avg_font_size = sum(font_sizes) / len(font_sizes) if font_sizes else 12

        text_blocks = []
        current_list = []
        current_list_type = None
        current_paragraph = []
        last_y = None

        for line in lines:
            line_text = line["text"].strip()

            if not line_text:
                self._flush_current_blocks(
                    text_blocks, current_paragraph, current_list, current_list_type
                )
                current_paragraph = []
                current_list = []
                current_list_type = None
                last_y = line["y0"]
                continue

            is_heading = line["font_size"] > avg_font_size * 1.2
            heading_level = self._get_heading_level(line["font_size"], avg_font_size)

            list_match = self._detect_list_item(line_text)

            is_new_block = False
            if last_y is not None:
                line_gap = line["y0"] - last_y
                avg_line_height = line["height"]
                if line_gap > avg_line_height * 1.5:
                    is_new_block = True

            if is_heading:
                self._flush_current_blocks(
                    text_blocks, current_paragraph, current_list, current_list_type
                )
                current_paragraph = []
                current_list = []
                current_list_type = None

                text_blocks.append(
                    {
                        "type": "heading",
                        "content": line_text,
                        "level": heading_level,
                        "y_position": line["y0"],
                    }
                )

            elif list_match:
                list_type, list_text = list_match

                if is_new_block and current_list:
                    self._flush_current_blocks(
                        text_blocks, current_paragraph, current_list, current_list_type
                    )
                    current_paragraph = []
                    current_list = []
                    current_list_type = None

                if current_paragraph:
                    self._flush_current_blocks(text_blocks, current_paragraph, [], None)
                    current_paragraph = []

                if current_list_type is None:
                    current_list_type = list_type
                    current_list = [(list_text, line["y0"])]
                elif current_list_type == list_type:
                    current_list.append((list_text, line["y0"]))
                else:
                    self._flush_current_blocks(
                        text_blocks, [], current_list, current_list_type
                    )
                    current_list = [(list_text, line["y0"])]
                    current_list_type = list_type

            else:
                if is_new_block and current_paragraph:
                    self._flush_current_blocks(text_blocks, current_paragraph, [], None)
                    current_paragraph = []

                if current_list:
                    self._flush_current_blocks(
                        text_blocks, [], current_list, current_list_type
                    )
                    current_list = []
                    current_list_type = None

                if not current_paragraph:
                    current_paragraph = [(line_text, line["y0"])]
                else:
                    current_paragraph.append((line_text, line["y0"]))

            last_y = line["y0"] + line["height"]

        self._flush_current_blocks(
            text_blocks, current_paragraph, current_list, current_list_type
        )

        return text_blocks

    def _group_words_into_lines(self, words: list[dict]) -> list[dict[str, Any]]:
        if not words:
            return []

        lines_dict = defaultdict(list)

        for word in words:
            y_key = round(word["top"], 1)
            lines_dict[y_key].append(word)

        sorted_lines = sorted(lines_dict.items(), key=lambda x: x[0])

        lines = []
        for y_pos, line_words in sorted_lines:
            line_words.sort(key=lambda w: w["x0"])

            text = " ".join(w["text"] for w in line_words)

            font_sizes = [w.get("height", 12) for w in line_words]
            font_size = max(set(font_sizes), key=font_sizes.count) if font_sizes else 12

            lines.append(
                {
                    "text": text,
                    "y0": line_words[0]["top"],
                    "height": font_size,
                    "font_size": font_size,
                    "x0": line_words[0]["x0"],
                }
            )

        return lines

    def _detect_list_item(self, text: str) -> tuple[str, str] | None:
        bullet_pattern = r"^[\u2022\u2023\u2043\u25E6\u25AA\u25AB\u25CF\u25CB\u25A0\u25A1•\-\*\+]\s+(.+)$"
        match = re.match(bullet_pattern, text)
        if match:
            return ("bullet", match.group(1))

        numbered_pattern = r"^(\d+|[a-zA-Z])[.)]\s+(.+)$"
        match = re.match(numbered_pattern, text)
        if match:
            return ("numbered", match.group(2))

        return None

    def _get_heading_level(self, font_size: float, avg_font_size: float) -> int:
        ratio = font_size / avg_font_size

        if ratio >= 2.0:
            return 1
        elif ratio >= 1.7:
            return 2
        elif ratio >= 1.4:
            return 3
        elif ratio >= 1.2:
            return 4
        else:
            return 5

    def _flush_current_blocks(
        self,
        text_blocks: list[dict],
        paragraph: list[tuple[str, float]],
        list_items: list[tuple[str, float]],
        list_type: str | None,
    ):
        if paragraph:
            text = " ".join(line[0] for line in paragraph)
            y_pos = paragraph[0][1]
            text_blocks.append(
                {
                    "type": "paragraph",
                    "content": text,
                    "y_position": y_pos,
                }
            )

        if list_items and list_type:
            y_pos = list_items[0][1]
            text_blocks.append(
                {
                    "type": "list",
                    "list_type": list_type,
                    "items": [item[0] for item in list_items],
                    "y_position": y_pos,
                }
            )

    def _merge_page_elements(
        self,
        text_blocks: list[dict[str, Any]],
        tables: list[dict[str, Any]],
        images: list[dict[str, Any]],
    ) -> str:
        all_elements = []
        for block in text_blocks:
            all_elements.append(
                {
                    "type": block["type"],
                    "content": block,
                    "pos": block["y_position"],
                }
            )

        for table in tables:
            all_elements.append(
                {
                    "type": "table",
                    "content": table["markdown"],
                    "pos": table["y_position"],
                }
            )

        for image in images:
            all_elements.append(
                {
                    "type": "image",
                    "content": image["markdown"],
                    "pos": image["y_position"],
                }
            )

        all_elements.sort(key=lambda x: x["pos"])

        parts = []
        for element in all_elements:
            if element["type"] == "heading":
                block = element["content"]
                level = block["level"]
                parts.append(f"{'#' * level} {block['content']}")

            elif element["type"] == "paragraph":
                parts.append(element["content"]["content"])

            elif element["type"] == "list":
                block = element["content"]
                list_md = self._format_list(block["items"], block["list_type"])
                parts.append(list_md)

            elif element["type"] == "table":
                parts.append(element["content"])

            elif element["type"] == "image":
                parts.append(element["content"])

        return "\n\n".join(parts)

    def _format_list(self, items: list[str], list_type: str) -> str:
        lines = []
        for i, item in enumerate(items, 1):
            if list_type == "bullet":
                lines.append(f"- {item}")
            else:
                lines.append(f"{i}. {item}")
        return "\n".join(lines)

    def _process_tables_with_images(
        self, page: Page
    ) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
        tables_info = []
        used_images = []

        tables = page.find_tables()

        for table_obj in tables:
            table_bbox = table_obj.bbox
            extracted_table = table_obj.extract()

            if not extracted_table:
                continue

            for img_obj in page.images:
                img_bbox = (
                    img_obj["x0"],
                    img_obj["top"],
                    img_obj["x1"],
                    img_obj["bottom"],
                )

                if self._is_bbox_inside(img_bbox, table_bbox):
                    img_bytes = self._extract_image_from_page(page, img_bbox)

                    if img_bytes and len(img_bytes) > 2000:
                        img_markdown = self._image_to_md(img_bytes, "png")
                        used_images.append(img_obj)

                        img_center_x = (img_obj["x0"] + img_obj["x1"]) / 2
                        img_center_y = (img_obj["top"] + img_obj["bottom"]) / 2

                        cell_position = self._get_cell_at_position(
                            table_obj, img_center_x, img_center_y
                        )

                        if cell_position:
                            row_idx, col_idx = cell_position

                            if row_idx < len(extracted_table) and col_idx < len(
                                extracted_table[row_idx]
                            ):
                                current_content = (
                                    extracted_table[row_idx][col_idx] or ""
                                )

                                if content := current_content.strip():
                                    extracted_table[row_idx][
                                        col_idx
                                    ] = f"{content} {img_markdown}"
                                else:
                                    extracted_table[row_idx][col_idx] = img_markdown

            tables_info.append(
                {
                    "bbox": table_bbox,
                    "markdown": self._table_to_markdown(extracted_table),
                    "y_position": table_bbox[1],
                }
            )

        return tables_info, used_images

    def _process_standalone_images(
        self,
        page: Page,
        tables_info: list[dict[str, Any]],
        used_images: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        image_markdowns = []

        for img_obj in page.images:
            if any(img_obj == used_img for used_img in used_images):
                continue

            img_bbox = (img_obj["x0"], img_obj["top"], img_obj["x1"], img_obj["bottom"])
            in_table = any(
                self._is_bbox_inside(img_bbox, table_info["bbox"])
                for table_info in tables_info
            )

            if not in_table:
                img_bytes = self._extract_image_from_page(page, img_bbox)

                if img_bytes and len(img_bytes) > 2000:
                    image_markdowns.append(
                        {
                            "markdown": self._image_to_md(img_bytes, "png"),
                            "y_position": img_obj["top"],
                        }
                    )

        return image_markdowns

    def _extract_image_from_page(
        self, page: Page, bbox: tuple[float, float, float, float], resolution: int = 150
    ) -> bytes | None:
        try:
            cropped_page = page.within_bbox(bbox)
            img = cropped_page.to_image(resolution=resolution)

            img_buffer = BytesIO()
            img.original.save(img_buffer, format="PNG")
            return img_buffer.getvalue()

        except Exception as e:
            print(f"Ошибка при извлечении изображения: {e}")
            return None

    def _get_cell_at_position(
        self, table: Any, x: float, y: float
    ) -> tuple[int, int] | None:
        if not hasattr(table, "cells") or not table.cells:
            return None

        for row_idx, row_cells in enumerate(table.cells):
            for col_idx, cell in enumerate(row_cells):
                if cell and isinstance(cell, (list, tuple)) and len(cell) >= 4:
                    x0, top, x1, bottom = cell
                    if x0 <= x <= x1 and top <= y <= bottom:
                        return (row_idx, col_idx)

        return None

    def _table_to_markdown(self, table: list[list[str | None]]) -> str:
        if not table or not table[0]:
            return ""

        markdown_lines = []
        num_cols = len(table[0])

        header = (
            "| "
            + " | ".join(
                str(cell or "").strip().replace("\n", " ") for cell in table[0]
            )
            + " |"
        )
        markdown_lines.append(header)

        separator = "| " + " | ".join("---" for _ in range(num_cols)) + " |"
        markdown_lines.append(separator)

        for row in table[1:]:
            normalized_row = list(row) + [None] * (num_cols - len(row))
            row_str = (
                "| "
                + " | ".join(
                    str(cell or "").strip().replace("\n", " ")
                    for cell in normalized_row[:num_cols]
                )
                + " |"
            )
            markdown_lines.append(row_str)

        return "\n".join(markdown_lines)

    def _is_bbox_inside(
        self,
        inner_bbox: tuple[float, float, float, float],
        outer_bbox: tuple[float, float, float, float],
        tolerance: float = 2.0,
    ) -> bool:
        ix0, itop, ix1, ibottom = inner_bbox
        ox0, otop, ox1, obottom = outer_bbox

        return (
            ix0 >= ox0 - tolerance
            and ix1 <= ox1 + tolerance
            and itop >= otop - tolerance
            and ibottom <= obottom + tolerance
        )
