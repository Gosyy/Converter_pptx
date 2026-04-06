from __future__ import annotations

import requests

from src.config import settings

TEXT_FORMATS = {"md", "txt", "csv", "tsv", "json"}


def rust_sidecar_enabled() -> bool:
    return settings.FEATURE_RUST_SIDECAR


def parse_document(filename: str, content: bytes) -> str | None:
    if not rust_sidecar_enabled():
        return None

    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in TEXT_FORMATS:
        return None

    try:
        resp = requests.post(
            f"{settings.RUST_SIDECAR_URL}/parse",
            json={"filename": filename, "content": content.decode("utf-8", errors="strict")},
            timeout=settings.RUST_SIDECAR_TIMEOUT,
        )
        if not resp.ok:
            return None
        data = resp.json()
        return data.get("markdown")
    except Exception:
        return None


def markdown_to_ast(markdown_text: str) -> dict | None:
    if not rust_sidecar_enabled():
        return None
    try:
        resp = requests.post(
            f"{settings.RUST_SIDECAR_URL}/ast",
            json={"markdown": markdown_text},
            timeout=settings.RUST_SIDECAR_TIMEOUT,
        )
        if not resp.ok:
            return None
        return resp.json()
    except Exception:
        return None


def format_stream_chunk(chunk: str) -> str:
    if not rust_sidecar_enabled():
        return chunk
    try:
        resp = requests.post(
            f"{settings.RUST_SIDECAR_URL}/format",
            json={"chunk": chunk},
            timeout=settings.RUST_SIDECAR_TIMEOUT,
        )
        if not resp.ok:
            return chunk
        return resp.json().get("chunk", chunk)
    except Exception:
        return chunk
