# -*- coding: utf-8 -*-
"""
model_services.py (stable baseline final)
- Strict context from text.txt
- SentenceTransformer + cosine retrieval
- Robust JSON handling: sanitize, balanced parse, JSON-only retry
- Safe prompts (triple-single quotes)
- Single-slide editor prompt for "Writing" actions only:
  polish | correct | translate | expand | shorten | simplify | specify
"""

from __future__ import annotations

import json
import logging
import os
from typing import Generator

from fastapi import HTTPException

from src.config import ModelAction, model_settings, settings
from src.modules.models import FZ44RAGSearcher, SlideContentGenerator
from src.modules.models.rag import DocumentProcessor, QdrantVectorDatabase
from src.schemas.model_schemas import ClassifierOut, StructureOut
from src.utils import json_utils, model_api_utils, text_utils


def setup_logging(level: int = logging.INFO):
    logging.basicConfig(level=level, format="%(asctime)s | %(levelname)s | %(message)s")
    logging.info("Logging initialized")


def get_runtime_api_key() -> str:
    return model_api_utils.get_api_key()


class IntegratedPipeline:
    def __init__(
        self,
        api_key: str,
        embedding_model: str = settings.DEFAULT_EMBEDDING_MODEL,
        llm_model: str = settings.DEFAULT_MODEL,
        collection_name: str = "atomic_hack",
    ):
        self.api_key = api_key
        self.llm_model = llm_model
        self.doc_processor = DocumentProcessor()
        self.vector_db = QdrantVectorDatabase(collection_name, embedding_model)
        self.searcher = FZ44RAGSearcher(self.vector_db)
        logging.info("✓ Pipeline initialized")

    def load_documents(self, documents: list[str], metadata: list[dict] | None = None):
        logging.info(f"Loading {len(documents)} documents into RAG...")
        all_chunks, metadata = [], (metadata or [])
        for i, doc in enumerate(documents):
            meta = metadata[i] if i < len(metadata) else {"doc_id": i}
            path = meta.get("source")
            if path and os.path.exists(path):
                all_chunks.extend(self.doc_processor.process_document(doc, meta))
            else:
                all_chunks.extend(self.doc_processor.process_document(doc, meta))

        self.vector_db.add_documents(all_chunks)
        logging.info(f"✓ Loaded {len(all_chunks)} chunks")

    def run(self, user_request: str, project_context: str = "") -> Generator:
        logging.info("=" * 60)
        logging.info("START PIPELINE")
        logging.info("=" * 60)
        logging.info("[STEP 1] Classifier")
        clf, _ = self.run_classifier(user_request)
        audience = clf.label
        logging.info(f"Audience: {audience} (conf={clf.confidence:.2f})")
        logging.info("[STEP 2] Planner")
        struct, _ = self.run_planner(audience, project_context)
        slides = [s.model_dump() for s in struct.slides]
        slide_structure = [
            {
                "id": s.get("slide_id"),
                "slide_id": s.get("slide_id"),
                "title": s.get("title", ""),
                "task": s.get("task", ""),
            }
            for s in slides
        ]
        logging.info(f"Slides planned: {len(slide_structure)}")
        logging.info("[STEP 3] Content Generation")
        gen = SlideContentGenerator(self.api_key, self.searcher, self.llm_model)
        data = {
            "presentation_topic": user_request[:200],
            "slide_structure": slide_structure,
        }
        return gen.generate_presentation_content(data)

    def replace_chart(self, slide: dict, params: dict, slides: list) -> dict:
        title = slide.get("title", "")
        task = (params or {}).get("task", "")
        query = f"{title} {task}".strip() or title
        retrieved = self.searcher.search(query, top_k=model_settings.TOP_K_RETRIEVAL)
        blocks = self.searcher.generate_charts_with_llm(
            slide.get("slide_id"), title, task, title, retrieved, max_tokens=600
        )
        content = (
            f"### {title}\n\n" + "\n\n".join(blocks)
            if blocks and self.searcher._should_chart_only(title, task)
            else (
                slide.get("content", "").rstrip()
                + ("\n\n**Визуализация:**\n\n" if blocks else "")
                + "\n\n".join(blocks)
            )
        )
        return {
            "slide_id": slide.get("slide_id"),
            "title": title,
            "content": content,
            "edits_applied": ["replace_chart"],
            "assets": [{"type": "chart", "payload": b} for b in blocks],
            "requires_external_data": False,
            "explanation": "Charts rebuilt by LLM from retrieved RAG data.",
        }

    def run_classifier(self, user_text: str) -> tuple[ClassifierOut, str]:
        prompt = text_utils.safe_format(
            model_settings.CLASSIFIER_PROMPT, user_text=user_text
        )
        resp = model_api_utils.call_model(
            [{"role": "user", "content": prompt}],
            api_key=self.api_key,
            model=self.llm_model,
            max_tokens=400,
            temperature=0.1,
        )
        raw = model_api_utils.get_content(resp)
        raw_clean = text_utils.pre_sanitize(raw)
        parsed = json_utils.extract_json_balanced(raw_clean) or None
        if parsed is None:
            resp2 = model_api_utils.call_model(
                [
                    {
                        "role": "user",
                        "content": model_settings.JSON_ONLY_PROMPT + "\n\n" + prompt,
                    }
                ],
                api_key=self.api_key,
                model=self.llm_model,
                max_tokens=400,
                temperature=0.1,
            )
            raw2 = model_api_utils.get_content(resp2)
            raw2_clean = text_utils.pre_sanitize(raw2)
            parsed = json_utils.extract_json_balanced(raw2_clean)
            if parsed is not None:
                raw = raw2
        if parsed is None:
            raise ValueError(
                "Classifier output not parseable as JSON. Raw:\n" + raw_clean
            )
        return ClassifierOut.model_validate(parsed), raw

    def run_planner(
        self, audience: str, project_context: str
    ) -> tuple[StructureOut, str]:
        snippet = (project_context or "")[:4000]
        prompt = text_utils.safe_format(
            model_settings.PLANNER_PROMPT, audience=audience, context_snippet=snippet
        )
        resp = model_api_utils.call_model(
            [{"role": "user", "content": prompt}],
            api_key=self.api_key,
            model=self.llm_model,
            max_tokens=1000,
            temperature=0.1,
        )
        raw = model_api_utils.get_content(resp)
        raw_clean = text_utils.pre_sanitize(raw)
        arr = json_utils.extract_json_array(raw_clean)
        if arr is None:
            resp2 = model_api_utils.call_model(
                [
                    {
                        "role": "user",
                        "content": model_settings.JSON_ONLY_PROMPT + "\n\n" + prompt,
                    }
                ],
                api_key=self.api_key,
                model=self.llm_model,
                max_tokens=1000,
                temperature=0.1,
            )
            raw2 = model_api_utils.get_content(resp2)
            raw2_clean = text_utils.pre_sanitize(raw2)
            if raw2 and raw2 != raw:
                raw = raw2
                raw_clean = raw2_clean
            arr = json_utils.extract_json_array(raw_clean)
        if arr is None:
            raise ValueError(
                "Planner output not parseable as JSON array. Raw (sanitized):\n"
                + raw_clean
            )
        normalized = []
        for i, item in enumerate(arr, start=1):
            if isinstance(item, dict):
                title = (item.get("title") or item.get("name") or f"Слайд {i}").strip()
                task = (item.get("task") or item.get("description") or "").strip()
            else:
                title, task = str(item), ""
            if not task:
                task = "Сформулируй контекст и ключевые тезисы по заголовку."
            normalized.append(
                {
                    "slide_id": i,
                    "title": " ".join(title.split()[:6]),
                    "task": task[:200],
                }
            )
        if len(normalized) < model_settings.MIN_SLIDES:
            for j in range(len(normalized) + 1, model_settings.MIN_SLIDES + 1):
                normalized.append(
                    {
                        "slide_id": j,
                        "title": f"Доп. слайд {j}",
                        "task": "Автоматически добавлен.",
                    }
                )
        if len(normalized) > model_settings.MAX_SLIDES:
            normalized = normalized[: model_settings.MAX_SLIDES]
        for idx, it in enumerate(normalized, start=1):
            it["slide_id"] = idx
        return StructureOut.model_validate({"slides": normalized}), raw

    def regenerate_slide(
        self,
        user_prompt: str,
        slide: dict,
        action: ModelAction,
        slides: list | None = None,
        params: dict | None = None,
    ) -> dict:
        slides = slides or []
        params = params or {}

        if action == ModelAction.REPLACE_CHART:
            return self.replace_chart(slide, params, slides)

        payload = {
            "slide_id": slide.get("slide_id"),
            "title": slide.get("title", ""),
            "content": slide.get("content", ""),
            "action": action.value if hasattr(action, "value") else str(action),
            "params": params,
        }
        if action == ModelAction.CUSTOM:
            payload["custom_prompt"] = user_prompt

        messages = [
            {
                "role": "user",
                "content": model_settings.SINGLE_SLIDE_EDIT_PROMPT
                + "\nUserInput: "
                + json.dumps(payload, ensure_ascii=False),
            }
        ]

        resp = model_api_utils.call_model(
            messages,
            self.api_key,
            model=self.llm_model,
            max_tokens=600,
            temperature=0.2,
        )
        raw = text_utils.pre_sanitize(model_api_utils.get_content(resp))
        parsed = json_utils.extract_json_balanced(raw)

        if not isinstance(parsed, dict):
            resp2 = model_api_utils.call_model(
                [
                    {
                        "role": "user",
                        "content": model_settings.JSON_ONLY_PROMPT + "\n\n" + messages[0]["content"],
                    }
                ],
                self.api_key,
                model=self.llm_model,
                max_tokens=600,
                temperature=0.2,
            )
            raw2 = text_utils.pre_sanitize(model_api_utils.get_content(resp2))
            parsed = json_utils.extract_json_balanced(raw2)

        if not isinstance(parsed, dict):
            raise HTTPException(status_code=502, detail="Invalid JSON from edit model")

        return parsed


setup_logging(logging.INFO)


async def generate_presentation(user_prompt: str, project_context: str, model: str):
    pipe = IntegratedPipeline(
        api_key=get_runtime_api_key(),
        embedding_model=settings.DEFAULT_EMBEDDING_MODEL,
        llm_model=model or settings.DEFAULT_MODEL,
    )
    pipe.load_documents([project_context])

    for slide in pipe.run(user_prompt, project_context=project_context):
        title = slide.get("title", "Untitled")
        content = slide.get("content", "")
        yield f"# {title}\n\n{content.strip()}\n\n"


def edit_one_slide(user_prompt, slide: dict, action: ModelAction, model: str) -> str:
    pipe = IntegratedPipeline(
        api_key=get_runtime_api_key(),
        embedding_model=settings.DEFAULT_EMBEDDING_MODEL,
        llm_model=model or settings.DEFAULT_MODEL,
    )
    edited = pipe.regenerate_slide(user_prompt, slide, action)
    title = edited.get("title", slide.get("title", ""))
    content = edited.get("content", "")
    return f"# {title}\n\n{content}\n"
