import logging

from qdrant_client import QdrantClient
from qdrant_client.http import models
import uuid

from src.config import settings
from src.modules.models.model_manager import model_manager


class QdrantVectorDatabase:
    def __init__(
        self,
        collection_name: str,
        embedding_model_name: str = settings.DEFAULT_EMBEDDING_MODEL,
    ):
        if not QdrantClient:
            raise RuntimeError("qdrant-client required.")

        # In-memory mode - no server needed!
        self.client = QdrantClient(":memory:")

        self.collection_name = collection_name

        # Use singleton model manager instead of creating new instances
        self.encoder = model_manager.get_embedding_model(embedding_model_name)
        self.vector_size = model_manager.get_embedding_dimension()

        # Rest of your code stays the same
        if not self.client.collection_exists(self.collection_name):
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(
                    size=self.vector_size, distance=models.Distance.COSINE
                ),
            )

    def add_documents(self, chunks: list[dict]):
        if not chunks:
            return

        points = []
        for item in chunks:
            vector = self.encoder.encode(item["text"]).tolist()
            doc_id = str(uuid.uuid4())
            points.append(
                models.PointStruct(
                    id=doc_id,
                    vector=vector,
                    payload={
                        "context": item["text"],
                        "file_name": item["metadata"].get("source"),
                        "chunk_index": item["chunk_id"],
                        "id": doc_id,
                    },
                )
            )

        batch_size = 100
        for i in range(0, len(points), batch_size):
            batch = points[i : i + batch_size]
            self.client.upsert(collection_name=self.collection_name, points=batch)

        logging.info(
            f"Added {len(chunks)} chunks. Total points: "
            f"{self.client.get_collection(self.collection_name).points_count}"
        )
