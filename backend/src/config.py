from enum import Enum
from pathlib import Path
import textwrap
from typing import ClassVar

from pydantic_settings import BaseSettings, SettingsConfigDict


class _Settings(BaseSettings):
    # GigaChat API
    GIGACHAT_AUTH_KEY: str
    GIGACHAT_OAUTH_URL: str = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
    GIGACHAT_API_URL: str = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions"
    GIGACHAT_SCOPE: str = "GIGACHAT_API_PERS"
    GIGACHAT_VERIFY_SSL: bool = True

    # External secret manager (optional)
    SECRET_MANAGER_URL: str = ""
    SECRET_MANAGER_TOKEN: str = ""
    SECRET_MANAGER_TIMEOUT: int = 5

    # Основные модели
    DEFAULT_MODEL: str = "GigaChat-2-Pro"
    DEFAULT_EMBEDDING_MODEL: str = "openai/gpt-oss-120b"
    CROSS_ENCODER_MODEL: str = "google/gemma-3-12b-it"
    
    DEFAULT_MODEL_VALUES: ClassVar[list[str]] = [
        "GigaChat-2",
        "GigaChat-2-Pro",
        "GigaChat-2-Max"
    ]

    # Qdrant
    QDRANT_HOST: str = "http://localhost:6333"
    QDRANT_API_KEY: str = "your_qdrant_key"

    # Временные файлы
    TEMPFILE_DIR: Path = Path("./tmp")
    TEMPFILE_CLEANUP_INTERVAL_SECONDS: int = 3600
    PRELOAD_MODELS: bool = False

    # Домены и фронт
    DOMAIN: str = "http://localhost:3000"
    FRONT_URL: str = "http://localhost:3000"
    CORS_ORIGINS: str = "http://localhost:3000"

    # PostgreSQL
    USE_DATABASE: bool = False
    POSTGRES_USER: str | None = None
    POSTGRES_PASSWORD: str | None = None
    POSTGRES_DB: str | None = None
    POSTGRES_HOST: str | None = None
    POSTGRES_PORT: int = 5432

    # Feature flags
    FEATURE_RUST_SIDECAR: bool = False
    FEATURE_KANDINSKY: bool = False
    FEATURE_PROGRESS_WS: bool = True
    FEATURE_DB_TOGGLE_ADMIN: bool = True

    # Rust sidecar
    RUST_SIDECAR_URL: str = "http://rust-sidecar:7001"
    RUST_SIDECAR_TIMEOUT: int = 30

    # Kandinsky (auto internal/public selection)
    KANDINSKY_INTERNAL_URL: str | None = None
    KANDINSKY_INTERNAL_TOKEN: str | None = None
    KANDINSKY_PUBLIC_URL: str | None = None
    KANDINSKY_PUBLIC_API_KEY: str | None = None
    KANDINSKY_TIMEOUT: int = 60

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)


class _ModelSettings(BaseSettings):
    MIN_SLIDES: int = 10
    MAX_SLIDES: int = 15
    TOP_K_RETRIEVAL: int = 5

    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 50

    GEN_TEMPERATURE: float = 0.2

    JSON_ONLY_PROMPT: str = (
        "Previous reply was not valid JSON. Please REPLY with valid JSON only (no explanations, no code fences)."
    )

    PLANNER_PROMPT: str = textwrap.dedent(
        """
    Ты — генератор структуры презентации (только структура, без содержания).
    Вход: audience (TopManagement | Experts | Investors) и краткий project_context.
    Задача: вернуть строго ТОЛЬКО JSON-массив объектов в формате:
    [{{"slide_id":1,"title":"Заголовок","task":"Короткое задание"}}, ...]

    Требования:
    - Количество слайдов обязательно 10–15.
    - slide_id — последовательные целые числа, начиная с 1.
    - title — короткий заголовок на русском (не больше 6 слов).
    - task — 1–2 коротких предложений с заданием для генерации контента (на русском).
    - Верни ТОЛЬКО валидный JSON-массив без пояснений и кода.
    AUDIENCE: {audience}
    PROJECT_CONTEXT_SNIPPET: {context_snippet}
    """
    )

    CLASSIFIER_PROMPT: str = textwrap.dedent(
        """
    Ты — классификатор аудитории для генерации презентаций. На входе — короткий user_request и (опционально) project_context.
    Верни строго JSON с полями:
    - label: одно из ["TopManagement","Experts","Investors"]
    - confidence: 0.0-1.0
    - rationale: 1-2 предложения почему
    - suggested_actions: список коротких действий

    Return ONLY the JSON object — no extra text.
    USER_QUERY: {user_text}
    """
    )

    SINGLE_SLIDE_EDIT_PROMPT: str = textwrap.dedent(
        """
    Ты — редактор одного слайда презентации.

    Вход (РОВНО один JSON-объект):
    - slide_id (int)
    - title (string)
    - content (string)     # полный текст слайда: 1–2 фразы и 3–4 буллета
    - action (string)      # одно из: polish | correct | translate | expand | shorten | simplify | specify | custom
    - params (object)      # опциональные параметры действия
    - custom_prompt (string) # пользовательская инструкция для режима 'custom' (опционально)

    Требования к действию (выполни только выбранное action):
    - polish: улучшай стиль и логику, избегай тавтологий и пассивного залога; не меняй смысл; объём ±10%; термины сохраняй (params.preserve_terms=true — обязательно сохранить).
    - correct: исправь орфографию/пунктуацию/грамматику; форматируй числа (разделители тысяч пробелом, % слитно), единицы и названия не меняй; объём тот же.
    - translate: переведи на язык params.lang (например, "en"); структура обязательна: 1–2 фразы, пустая строка, 3–4 буллета; имена компаний/аббревиатуры не переводить, если общеприняты.
    - expand: добавь 1–2 уместных уточнения, используя ТОЛЬКО факты из content/params; не придумывай числа; максимум 4 буллета; можно использовать params.focus для приоритета темы.
    - shorten: сократи до сути: 1–2 фразы и максимум 4 буллета; каждый буллет ≤ 70 символов; убери повторы и вводные слова.
    - simplify: упростись для широкой аудитории: замени сложные конструкции простыми, убери канцелярит/жаргон; термины оставь.
    - specify: сделай формулировки предметнее, заменяя общее на конкретное ТОЛЬКО из content; если есть числа — используй их; новые факты не добавляй.
    - custom: следуй тексту custom_prompt, соблюдая формат вывода и ограничения ниже.

    Общие ограничения:
    - Используй ТОЛЬКО факты из content или params. Числа не выдумывай.
    - Язык вывода = язык входного content (кроме translate, там язык = params.lang).
    - Если для выполнения не хватает данных (например, отсутствует params.lang для translate) — выставь requires_external_data=true и в explanation кратко перечисли, что нужно.

    Формат ВЫХОДА (РОВНО один JSON-объект, без пояснений и без кода):
    {
    "slide_id": <int>,
    "title": "<новый заголовок или пусто>",
    "content": "<1–2 фразы, пустая строка, 3–4 буллета с префиксом '* '>",
    "edits_applied": ["<выполненное_действие>"],
    "assets": [],
    "requires_external_data": false,
    "explanation": "<1–2 предложения о внесённых изменениях>"
    }
    """
    )

    CHART_GENERATOR_PROMPT: str = textwrap.dedent(
        """
    You create DATA-DRIVEN charts using ONLY the PROVIDED CHUNKS and SLIDE CONTENT below.

    CONTEXT:
    TOPIC: {topic}
    SLIDE #{slide_id}: "{slide_title}"
    TASK: {slide_task}

    PROVIDED DATA (priority order):
    1. SLIDE_CONTENT: The text of the slide.
    2. CHUNKS: Additional context from the document.

    {chunks_text} # This contains both slide content and retrieved chunks

    CONSTRAINTS:
    - Prioritize data from the SLIDE_CONTENT. Use CHUNKS only if SLIDE_CONTENT lacks sufficient data.
    - Use ONLY numeric facts present in the provided data. Do NOT infer, average, extrapolate, or normalize.
    - If data is insufficient, return charts=[].
    - Keep labels short. Values must be numbers.
    - The chart title and labels must be in the same language as the slide content.
    - Prefer line for time series, bar for categories, pie for share breakdowns (≤6 items).
    - Max 2 charts.

    Return ONLY valid JSON with:
    {{
      "charts": [
        {{
          "type": "bar" | "line" | "pie",
          "title": "<short>",
          "labels": ["<l1>", "<l2>", "..."],
          "values": [n1, n2, ...],
          "reason": "<why this encoding is correct>",
          "used_facts": [{{ "excerpt": "<verbatim or close>", "chunk_id": "<id>" }}]
        }}
      ],
      "explanation": "<1-2 sentences>",
      "errors": []
    }}
    """
    )
    SLIDE_PROMPT_TEMPLATE: str = textwrap.dedent(
        """
            Ты — ассистент, который создаёт контент для слайда, используя ТОЛЬКО данные ниже.

            ТЕМА: {topic}
            СЛАЙД №{slide_id}: "{slide_title}"
            ЗАДАЧА: {slide_task}

            ИСТОЧНИКОВЫЕ CHUNKS:
            {chunks_text}

            ТРЕБОВАНИЯ:
            1) Используй ТОЛЬКО факты из CHUNKS; не выдумывай числа и источники.
            2) Верни РОВНО один валидный JSON-объект без пояснений, без кода и без ```
            3) Если релевантных данных нет — верни:
            {{ "slide_id": {slide_id}, "title": "{slide_title}", "used_facts": [], "content": "Данные для этого раздела отсутствуют" }}
            4) Структура JSON:
            - "slide_id": число
            - "title": строка
            - "used_facts": массив коротких дословных цитат из CHUNKS (каждая ≤ 80 символов)
            - "content": строка без markdown-заголовков:
                1–2 предложения, пустая строка, затем 3–4 буллета (каждый начинается с "* ", ≤ 70 символов)
            """
    )


class ModelAction(str, Enum):
    REPLACE_CHART = "replace_chart"
    CUSTOM = "custom"


settings = _Settings()
model_settings = _ModelSettings()
