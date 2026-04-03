from __future__ import annotations

import os
from pathlib import Path

import requests

from src.config import settings


def _read_from_file(secret_file_key: str | None) -> str | None:
    if not secret_file_key:
        return None
    secret_path = os.getenv(secret_file_key)
    if not secret_path:
        return None
    p = Path(secret_path)
    if not p.exists():
        return None
    value = p.read_text(encoding="utf-8").strip()
    return value or None


def _read_from_external_manager(secret_name: str) -> str | None:
    base_url = settings.SECRET_MANAGER_URL.strip()
    if not base_url:
        return None

    token = settings.SECRET_MANAGER_TOKEN.strip()
    headers = {"Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    endpoint = f"{base_url.rstrip('/')}/v1/secrets/{secret_name}"
    try:
        resp = requests.get(endpoint, headers=headers, timeout=settings.SECRET_MANAGER_TIMEOUT)
        if not resp.ok:
            return None
        data = resp.json()
        value = data.get("value")
        if isinstance(value, str) and value.strip():
            return value.strip()
    except Exception:
        return None
    return None


def read_secret(env_key: str, secret_file_key: str | None = None) -> str | None:
    file_value = _read_from_file(secret_file_key)
    if file_value:
        return file_value

    external_value = _read_from_external_manager(env_key)
    if external_value:
        return external_value

    value = os.getenv(env_key)
    if value:
        return value.strip()
    return None
