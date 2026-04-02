from __future__ import annotations

import time
from typing import Any

import requests

from src.config import settings


class _CircuitBreaker:
    def __init__(self, threshold: int = 3, cooldown_sec: int = 30):
        self.threshold = threshold
        self.cooldown_sec = cooldown_sec
        self.failures = 0
        self.open_until = 0.0

    def allow(self) -> bool:
        return time.time() >= self.open_until

    def on_success(self):
        self.failures = 0
        self.open_until = 0.0

    def on_failure(self):
        self.failures += 1
        if self.failures >= self.threshold:
            self.open_until = time.time() + self.cooldown_sec


class KandinskyService:
    def __init__(self):
        self.timeout = settings.KANDINSKY_TIMEOUT
        self._breaker = _CircuitBreaker(threshold=3, cooldown_sec=20)

    def _resolve_provider(self) -> tuple[str, str | None, str]:
        if settings.KANDINSKY_INTERNAL_URL:
            return (
                settings.KANDINSKY_INTERNAL_URL,
                settings.KANDINSKY_INTERNAL_TOKEN,
                "internal",
            )
        if settings.KANDINSKY_PUBLIC_URL:
            return (
                settings.KANDINSKY_PUBLIC_URL,
                settings.KANDINSKY_PUBLIC_API_KEY,
                "public",
            )
        raise RuntimeError("Kandinsky endpoint is not configured")

    def _post(self, path: str, payload: dict[str, Any]) -> dict[str, Any]:
        if not self._breaker.allow():
            raise RuntimeError("Kandinsky circuit breaker is open")

        base_url, token, provider = self._resolve_provider()
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"

        last_error: Exception | None = None
        for attempt in range(1, 4):
            try:
                resp = requests.post(
                    f"{base_url.rstrip('/')}/{path.lstrip('/')}",
                    json=payload,
                    headers=headers,
                    timeout=self.timeout,
                )
                resp.raise_for_status()
                data = resp.json()
                data["provider"] = provider
                self._breaker.on_success()
                return data
            except Exception as exc:
                last_error = exc
                time.sleep(0.25 * attempt)

        self._breaker.on_failure()
        raise RuntimeError(f"Kandinsky request failed after retries: {last_error}")

    def image_generation(self, prompt: str, style: str | None = None) -> dict[str, Any]:
        return self._post("generate", {"prompt": prompt, "style": style})

    def style_transfer(
        self,
        markdown: str,
        template_id: str | None = None,
        template_image_url: str | None = None,
    ) -> dict[str, Any]:
        return self._post(
            "style-transfer",
            {
                "markdown": markdown,
                "template_id": template_id,
                "template_image_url": template_image_url,
            },
        )
