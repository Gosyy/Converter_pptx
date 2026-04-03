import json
import time
import uuid

import requests

from src.config import settings, model_settings
from src.services.secret_manager import read_secret

_TOKEN_CACHE: dict[str, float | str] = {"access_token": "", "expires_at": 0.0}


def _auth_header_value(auth_key: str | None = None) -> str:
    value = (auth_key or settings.GIGACHAT_AUTH_KEY).strip()
    if value.lower().startswith("basic "):
        return value
    return f"Basic {value}"


def _get_gigachat_token(force_refresh: bool = False, auth_key: str | None = None) -> str:
    now = time.time()
    cached_token = str(_TOKEN_CACHE.get("access_token", ""))
    expires_at = float(_TOKEN_CACHE.get("expires_at", 0.0))
    if not force_refresh and cached_token and now < (expires_at - 30):
        return cached_token

    headers = {
        "Authorization": _auth_header_value(auth_key),
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        "RqUID": str(uuid.uuid4()),
    }
    resp = requests.post(
        settings.GIGACHAT_OAUTH_URL,
        headers=headers,
        data={"scope": settings.GIGACHAT_SCOPE},
        timeout=20,
        verify=settings.GIGACHAT_VERIFY_SSL,
    )
    if not resp.ok:
        raise RuntimeError(f"GigaChat auth error {resp.status_code}: {resp.text}")

    data = resp.json()
    token = (data.get("access_token") or "").strip()
    if not token:
        raise RuntimeError(f"Missing access_token in GigaChat auth response: {data}")

    expires_at_raw = data.get("expires_at")
    expires_in_raw = data.get("expires_in")
    expires_at = now + 30 * 60
    if isinstance(expires_at_raw, (int, float)):
        if expires_at_raw > 10_000_000_000:
            expires_at = float(expires_at_raw) / 1000.0
        else:
            expires_at = float(expires_at_raw)
    elif isinstance(expires_in_raw, (int, float)):
        expires_at = now + float(expires_in_raw)

    _TOKEN_CACHE["access_token"] = token
    _TOKEN_CACHE["expires_at"] = expires_at
    return token


def call_model(
    messages: list[dict],
    api_key: str,
    model: str = settings.DEFAULT_MODEL,
    temperature: float = model_settings.GEN_TEMPERATURE,
    max_tokens: int = 900,
    timeout: int = 60,
) -> dict:
    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    token = _get_gigachat_token(auth_key=api_key)
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    resp = requests.post(
        settings.GIGACHAT_API_URL,
        headers=headers,
        json=payload,
        timeout=timeout,
        verify=settings.GIGACHAT_VERIFY_SSL,
    )
    if resp.status_code == 401:
        refreshed = _get_gigachat_token(force_refresh=True, auth_key=api_key)
        headers["Authorization"] = f"Bearer {refreshed}"
        resp = requests.post(
            settings.GIGACHAT_API_URL,
            headers=headers,
            json=payload,
            timeout=timeout,
            verify=settings.GIGACHAT_VERIFY_SSL,
        )
    if not resp.ok:
        try:
            err = resp.json()
            raise RuntimeError(
                f"API error {resp.status_code}: {json.dumps(err, ensure_ascii=False)}"
            )
        except Exception:
            raise RuntimeError(f"API error {resp.status_code}: {resp.text}")
    return resp.json()


def get_content(resp: dict) -> str:
    try:
        return resp["choices"][0]["message"]["content"]
    except Exception as e:
        raise RuntimeError(
            f"Unexpected LLM response format: {json.dumps(resp, ensure_ascii=False)[:800]}"
        ) from e


def get_api_key(explicit: str | None = None) -> str:
    key = (explicit or read_secret("GIGACHAT_AUTH_KEY", "GIGACHAT_AUTH_KEY_FILE") or settings.GIGACHAT_AUTH_KEY or "").strip()
    key = _strip_invisible(key)
    if not key:
        raise RuntimeError(
            "API auth key required (set env GIGACHAT_AUTH_KEY)."
        )
    if not key.isascii():
        raise RuntimeError("API key contains non-ASCII characters.")
    return key


def _strip_invisible(s: str) -> str:
    if not s:
        return s
    s = "".join(
        ch
        for ch in s
        if ch.isprintable()
        and ch not in ("\u00a0", "\u2009", "\u200a", "\u202f", "\u2007", "\u2060")
    )
    s = s.replace("\u200b", "").replace("\u200c", "").replace("\u200d", "")
    return s
