import os

from sentence_transformers import CrossEncoder, SentenceTransformer

embedding_model = os.getenv(
    "DEFAULT_EMBEDDING_MODEL",
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
)
cross_encoder_model = os.getenv(
    "CROSS_ENCODER_MODEL",
    "cross-encoder/ms-marco-MiniLM-L-6-v2",
)

print(f"Downloading embedding model: {embedding_model}")
SentenceTransformer(embedding_model)
print(f"Downloading cross-encoder model: {cross_encoder_model}")
CrossEncoder(cross_encoder_model)
print("Model cache preload complete")
