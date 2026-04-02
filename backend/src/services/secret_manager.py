from __future__ import annotations

import os
from pathlib import Path


def read_secret(env_key: str, secret_file_key: str | None = None) -> str | None:
    if secret_file_key:
        secret_path = os.getenv(secret_file_key)
        if secret_path:
            p = Path(secret_path)
            if p.exists():
                value = p.read_text(encoding="utf-8").strip()
                if value:
                    return value

    value = os.getenv(env_key)
    if value:
        return value.strip()
    return None
