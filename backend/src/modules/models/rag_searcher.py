from __future__ import annotations
from typing import TYPE_CHECKING

from src.config import settings
from src.modules.models.model_manager import model_manager

if TYPE_CHECKING:
    from src.modules.models.rag import QdrantVectorDatabase


class FZ44RAGSearcher:
    def __init__(
        self,
        vector_db: QdrantVectorDatabase,
        cross_encoder_model: str = settings.CROSS_ENCODER_MODEL,
    ):
        self.vector_db = vector_db
        # Use singleton model manager instead of creating new instances
        self.cross_encoder = model_manager.get_cross_encoder_model(cross_encoder_model)

    def search_raw_candidates(self, query: str, top_k: int = 30) -> list:
        query_vector = self.vector_db.encoder.encode([query])[0].tolist()

        response = self.vector_db.client.search(
            collection_name=self.vector_db.collection_name,
            query_vector=query_vector,
            limit=top_k,
            with_payload=True,
        )

        candidates = []
        for hit in response:
            payload = hit.payload
            candidates.append(
                {
                    "text": payload.get("context"),
                    "score": hit.score,
                    "metadata": {
                        "source": payload.get("file_name"),
                        "chunk_id": payload.get("chunk_index"),
                    },
                }
            )
        return candidates

    def rerank_results(self, query: str, candidates: list, limit: int = 10) -> list:
        pairs = [(query, c.get("text") or "") for c in candidates]
        scores = self.cross_encoder.predict(pairs, batch_size=16)

        for i, score in enumerate(scores):
            candidates[i]["rerank_score"] = float(score)

        sorted_candidates = sorted(
            candidates, key=lambda x: x["rerank_score"], reverse=True
        )
        return sorted_candidates[:limit]

    def search(self, query: str, top_k: int = 30, rerank_limit: int = 5) -> list:
        candidates = self.search_raw_candidates(query, top_k=top_k)
        reranked = self.rerank_results(query, candidates, limit=rerank_limit)
        return reranked
