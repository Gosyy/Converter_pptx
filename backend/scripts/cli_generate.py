#!/usr/bin/env python3
"""CLI-клиент для генерации презентации через backend API без фронтенда."""

from __future__ import annotations

import argparse
from pathlib import Path
import sys

import requests


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Генерация презентации через /api/presentation/generate"
    )
    parser.add_argument("--api", default="http://localhost:8000/api", help="Базовый URL API")
    parser.add_argument("--file", required=True, help="Путь к входному файлу")
    parser.add_argument("--text", required=True, help="Промпт пользователя")
    parser.add_argument("--model", default="GigaChat-2", help="Название модели")
    parser.add_argument(
        "--out",
        default="generated_presentation.md",
        help="Файл для сохранения markdown-результата",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    src = Path(args.file)
    if not src.exists():
        print(f"Ошибка: файл не найден: {src}", file=sys.stderr)
        return 2

    endpoint = args.api.rstrip("/") + "/presentation/generate"
    markdown_parts: list[str] = []

    with src.open("rb") as fh:
        files = {"file": (src.name, fh)}
        data = {
            "text": args.text,
            "model": args.model,
            "client_id": "cli-client",
        }

        with requests.post(endpoint, data=data, files=files, stream=True, timeout=600) as resp:
            resp.raise_for_status()
            for chunk in resp.iter_content(chunk_size=8192, decode_unicode=True):
                if not chunk:
                    continue
                markdown_parts.append(chunk)

    out_path = Path(args.out)
    out_path.write_text("".join(markdown_parts), encoding="utf-8")
    print(f"Markdown сохранён: {out_path.resolve()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
