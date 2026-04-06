from __future__ import annotations
import json
import time
from typing import TYPE_CHECKING
import logging
import re

from src.config import settings, model_settings
from src.utils import json_utils, model_api_utils, text_utils

if TYPE_CHECKING:
    from src.modules.models.rag_searcher import FZ44RAGSearcher


class SlideContentGenerator:
    def __init__(
        self,
        api_key: str,
        searcher: FZ44RAGSearcher,
        model: str = settings.DEFAULT_MODEL,
    ):
        self.api_key = api_key
        self.searcher = searcher
        self.model = model
        self.used_facts: list[str] = []
        self.generation_metadata: Dict[str, Any] = {}

    def _chunks_to_text(self, retrieved: list[dict]) -> str:
        lines = []
        for i, r in enumerate(retrieved):
            raw = str(r.get("text", ""))
            txt = raw[:600].replace("\n", " ").replace("\r", " ")
            lines.append(f"{i+1}. {txt}")
        return "\n".join(lines)

    def generate_slide_prompt(
        self,
        slide_id: int,
        slide_title: str,
        slide_task: str,
        topic: str,
        retrieved: list[dict],
    ) -> str:
        chunks_text = self._chunks_to_text(retrieved)
        return text_utils.safe_format(
            model_settings.SLIDE_PROMPT_TEMPLATE,
            topic=topic,
            slide_id=str(int(slide_id)),
            slide_title=slide_title,
            slide_task=slide_task,
            chunks_text=chunks_text,
        )

    def call_api(self, prompt: str, max_tokens: int = 900, retry: int = 2) -> str:
        for attempt in range(retry):
            try:
                resp = model_api_utils.call_model(
                    [{"role": "user", "content": prompt}],
                    api_key=self.api_key,
                    model=self.model,
                    max_tokens=max_tokens,
                    temperature=0.2,
                    timeout=60,
                )
                return model_api_utils.get_content(resp)
            except Exception:
                if attempt < retry - 1:
                    time.sleep(1 + attempt * 2)
                    continue
                raise

    def _fallback(self, slide_id: int, slide_title: str) -> dict:
        return {
            "slide_id": slide_id,
            "title": slide_title,
            "used_facts": [],
            "content": "Данные для этого раздела отсутствуют",
        }

    def generate_slide_content(
        self, slide_id: int, slide_title: str, slide_task: str, topic: str
    ) -> dict:
        query = f"{slide_title} {slide_task} {topic}".strip()
        retrieved = self.searcher.search(query, top_k=model_settings.TOP_K_RETRIEVAL)
        logging.info(f"[Slide {slide_id}] retrieved={len(retrieved)}")
        prompt = self.generate_slide_prompt(
            slide_id, slide_title, slide_task, topic, retrieved
        )
        try:
            raw = self.call_api(prompt, max_tokens=900)
            parsed = json_utils.extract_json_balanced(raw)
            if not isinstance(parsed, dict):
                raise ValueError("Not a dict")
        except Exception:
            try:
                raw2 = self.call_api(
                    model_settings.JSON_ONLY_PROMPT + "\n\n" + prompt, max_tokens=900
                )
                parsed = json_utils.extract_json_balanced(raw2)
                if not isinstance(parsed, dict):
                    raise ValueError("Not a dict")
            except Exception as e:
                logging.warning(
                    f"[Slide {slide_id}] JSON parse failed: {e} -> fallback"
                )
                return self._fallback(slide_id, slide_title)
        if "slide_id" not in parsed or parsed["slide_id"] != slide_id:
            parsed["slide_id"] = slide_id
        parsed.setdefault("title", slide_title)
        parsed.setdefault("used_facts", [])

        content = (
            parsed.get("content")
            or f"### {slide_title}\n\n* Данные для этого раздела отсутствуют"
        )

        chart_blocks = self.generate_charts_with_llm(
            slide_id, slide_title, slide_task, topic, retrieved, max_tokens=600
        )

        if chart_blocks:
            if self._should_chart_only(slide_title, slide_task):
                content = f"### {slide_title}\n\n" + "\n\n".join(chart_blocks)
            else:
                content = (
                    content.rstrip()
                    + "\n\n**Визуализация:**\n\n"
                    + "\n\n".join(chart_blocks)
                )

            parsed.setdefault("assets", [])
            for cb in chart_blocks:
                parsed["assets"].append({"type": "chart", "payload": cb})

        parsed["content"] = content

        if isinstance(parsed.get("used_facts"), list):
            self.used_facts.extend(
                [u for u in parsed["used_facts"] if isinstance(u, str)]
            )
        return parsed

    def _validate_llm_charts(self, obj: dict) -> list[dict]:
        charts = obj.get("charts") or []
        out = []
        if not isinstance(charts, list):
            return out
        for ch in charts[:2]:
            t = (ch.get("type") or "").lower().strip()
            if t not in {"bar", "line", "pie"}:
                continue
            labels = ch.get("labels") or []
            values = ch.get("values") or []
            if not (isinstance(labels, list) and isinstance(values, list)):
                continue
            if len(labels) != len(values) or len(labels) < 2:
                continue
            try_vals = []
            ok = True
            for v in values:
                try:
                    try_vals.append(float(v))
                except Exception:
                    ok = False
                    break
            if not ok:
                continue
            title = str(ch.get("title") or "").strip() or "Диаграмма"
            out.append(
                {
                    "type": t,
                    "title": title,
                    "labels": [str(l) for l in labels],
                    "values": try_vals,
                }
            )
        return out

    def _chart_fence(self, spec: dict) -> str:
        import json as _json

        return (
            "```chart\n"
            f"type: {spec['type']}\n"
            f"title: {_json.dumps(spec['title'], ensure_ascii=False)}\n"
            f"labels: {_json.dumps(spec['labels'], ensure_ascii=False)}\n"
            f"values: {_json.dumps(spec['values'], ensure_ascii=False)}\n"
            f"colors: {_json.dumps(self._palette(len(spec['values'])), ensure_ascii=False)}\n"
            "```"
        )

    def _chunks_for_prompt(self, retrieved: list[dict]) -> str:
        lines = []
        for i, r in enumerate(retrieved):
            txt = (r.get("text") or "")[:700]
            cid = r.get("chunk_id", i)
            src = (r.get("metadata", {}) or {}).get("source", "unknown")
            lines.append(f"{i + 1}. [chunk_id={cid} source={src}]\n{txt}")
        return "\n\n".join(lines)

    def generate_charts_with_llm(
        self,
        slide_id: int,
        slide_title: str,
        slide_task: str,
        topic: str,
        retrieved: list[dict],
        max_tokens: int = 600,
    ) -> list[str]:
        chunks_text = self._chunks_for_prompt(retrieved) if retrieved else "(no data)"
        prompt = text_utils.safe_format(
            model_settings.CHART_GENERATOR_PROMPT,
            topic=self._safe_text(topic),
            slide_id=int(slide_id),
            slide_title=self._safe_text(slide_title),
            slide_task=self._safe_text(slide_task),
            chunks_text=chunks_text,
        )
        raw = self.call_api(prompt, max_tokens=max_tokens)
        obj = self.extract_json_from_text(raw)
        specs = self._validate_llm_charts(obj)
        fences = [self._chart_fence(sp) for sp in specs]
        return fences

    def _should_chart_only(self, slide_title: str, slide_task: str) -> bool:
        txt = f"{slide_title} {slide_task}".lower()
        triggers = [
            "chart",
            "диаграм",
            "график",
            "визуал",
            "kpi",
            "динамика",
            "trend",
            "timeseries",
            "распределение",
            "breakdown",
        ]
        return any(t in txt for t in triggers)

    def _palette(self, n: int) -> list[str]:
        base = [
            "#597ad3",
            "#de7c59",
            "#59d387",
            "#d359bf",
            "#d3c359",
            "#59b6d3",
            "#9b59d3",
        ]
        out = []
        i = 0
        while len(out) < n:
            out.append(base[i % len(base)])
            i += 1
        return out[:n]

    def _safe_text(self, text: str) -> str:
        return text.replace("{", "{{").replace("}", "}}")

    def extract_json_from_text(self, text: str) -> dict:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                return {}
        return {}

    def generate_presentation_content(self, presentation_data: dict):
        self.generation_metadata = {"total_facts_used": 0, "slides_generated": 0, "slides_with_fallback": 0}
        slides_content_for_logging = []
        for slide in presentation_data["slide_structure"]:
            sid = slide.get("slide_id") or slide.get("id")
            title = slide.get("title", f"Слайд {sid}")
            task = slide.get("task", "")
            sc = self.generate_slide_content(sid, title, task, presentation_data.get("presentation_topic", ""))
            yield sc
            slides_content_for_logging.append(sc)
            self.generation_metadata["slides_generated"] += 1
            if not sc.get("used_facts"):
                self.generation_metadata["slides_with_fallback"] += 1
            time.sleep(0.2)
        self.generation_metadata["total_facts_used"] = len(set(self.used_facts))
        logging.info("=== SLIDE SUMMARY ===")
        for s in slides_content_for_logging:
            logging.info(f"- id={s.get('slide_id')} title='{s.get('title','')[:40]}' facts={len(s.get('used_facts', []))}")
