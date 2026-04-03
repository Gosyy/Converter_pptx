FROM python:3.10-slim

WORKDIR /code
ARG PRELOAD_MODEL_CACHE=true

# Default model cache locations (can be overridden via environment)
ENV HF_HOME=/models_cache/huggingface \
    TRANSFORMERS_CACHE=/models_cache/huggingface/transformers \
    SENTENCE_TRANSFORMERS_HOME=/models_cache/sentence-transformers \
    TORCH_HOME=/models_cache/torch

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Ensure cache directories exist with sane permissions
RUN mkdir -p /models_cache/huggingface/transformers \
    /models_cache/sentence-transformers \
    /models_cache/torch && \
    chmod -R 777 /models_cache

# Optional warm cache during image build so runtime doesn't need internet
RUN if [ "$PRELOAD_MODEL_CACHE" = "true" ]; then python scripts/preload_model_cache.py; fi

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
