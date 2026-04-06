import os
import logging

# Сначала задаем кэш HuggingFace
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
CACHE_DIR = os.path.join(PROJECT_DIR, "..", "..", "..", "models_cache")

os.makedirs(CACHE_DIR, exist_ok=True)

os.environ["HF_HOME"] = CACHE_DIR
os.environ["TRANSFORMERS_CACHE"] = CACHE_DIR
os.environ["HF_DATASETS_CACHE"] = os.path.join(CACHE_DIR, "datasets")


from typing import Optional
from typing import Any

from src.config import settings


class ModelManager:
    """
    Singleton class to manage heavy models (SentenceTransformer, CrossEncoder)
    Ensures models are loaded only once and reused across the application
    """

    _instance: Optional["ModelManager"] = None
    _embedding_model: Optional[Any] = None
    _cross_encoder_model: Optional[Any] = None
    _initialized: bool = False

    def __new__(cls) -> "ModelManager":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if not self._initialized:
            self._initialized = True
            logging.info("ModelManager initialized")

    def get_embedding_model(self, model_name: str = None):
        if self._embedding_model is None:
            model_name = model_name or settings.DEFAULT_EMBEDDING_MODEL
            logging.info(f"Loading embedding model: {model_name}")
            try:
                import torch
                from sentence_transformers import SentenceTransformer

                device = "cuda" if torch.cuda.is_available() else "cpu"
                self._embedding_model = SentenceTransformer(model_name, device=device, cache_folder=CACHE_DIR)
                _ = self._embedding_model.encode(["warmup"], normalize_embeddings=False)
                logging.info(f"✓ Embedding model {model_name} ready on {device}")
            except Exception as e:
                logging.error(f"Failed to load embedding model {model_name}: {e}")
                raise
        return self._embedding_model

    def get_cross_encoder_model(self, model_name: str = None):
        if self._cross_encoder_model is None:
            model_name = model_name or settings.CROSS_ENCODER_MODEL
            logging.info(f"Loading cross encoder model: {model_name}")
            try:
                from sentence_transformers import CrossEncoder

                self._cross_encoder_model = CrossEncoder(model_name)
                _ = self._cross_encoder_model.predict([("warmup", "warmup")])
                logging.info(f"✓ Cross encoder model {model_name} ready")
            except Exception as e:
                logging.error(f"Failed to load cross encoder model {model_name}: {e}")
                raise
        return self._cross_encoder_model

    def preload_models(
        self, embedding_model: str = None, cross_encoder_model: str = None
    ):
        embedding_model = embedding_model or settings.DEFAULT_EMBEDDING_MODEL
        cross_encoder_model = cross_encoder_model or settings.CROSS_ENCODER_MODEL
        logging.info("Preloading models...")
        self.get_embedding_model(embedding_model)
        self.get_cross_encoder_model(cross_encoder_model)
        logging.info("✓ All models preloaded successfully")

    def get_embedding_dimension(self) -> int:
        if self._embedding_model is None:
            self.get_embedding_model()
        return self._embedding_model.get_sentence_embedding_dimension()

    def reset(self):
        self._embedding_model = None
        self._cross_encoder_model = None
        self._initialized = False
        ModelManager._instance = None


# Global instance
model_manager = ModelManager()
