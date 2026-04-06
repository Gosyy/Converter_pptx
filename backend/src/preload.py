import logging
import os

from src.config import settings
from src.modules.models.model_manager import model_manager


def _setup_logging():
    logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")


def preload_models():
    embed_model = os.environ.get("DEFAULT_EMBEDDING_MODEL", settings.DEFAULT_EMBEDDING_MODEL)
    cross_model = os.environ.get("CROSS_ENCODER_MODEL", settings.CROSS_ENCODER_MODEL)

    logging.info("Preloading models using ModelManager...")
    try:
        model_manager.preload_models(embed_model, cross_model)
        logging.info("✓ All models preloaded successfully")
    except Exception as e:
        logging.error(f"Model preload failed: {e}")
        raise


if __name__ == "__main__":
    _setup_logging()
    preload_models()
    logging.info("Preload finished")


