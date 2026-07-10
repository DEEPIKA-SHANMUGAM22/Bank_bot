from typing import List, Dict, Any, Tuple
from embeddings.embedding_service import EmbeddingService
from vectorstore.chroma_store import ChromaStore
from config import RETRIEVAL_TOP_K, SIMILARITY_THRESHOLD
from utils.logger import get_logger

logger = get_logger(__name__)


class Retriever:
    """Retrieves relevant document chunks for a query."""

    def __init__(self):
        self.embedding_service = EmbeddingService.get_instance()
        self.vector_store = ChromaStore.get_instance()

    def retrieve(self, query: str, top_k: int = RETRIEVAL_TOP_K) -> Tuple[List[Dict[str, Any]], bool]:
        """
        Retrieve top-k chunks for a query.

        Returns:
            (chunks, is_fallback)
            - chunks: list of retrieved chunks with scores
            - is_fallback: True if best score < SIMILARITY_THRESHOLD
        """
        query_embedding = self.embedding_service.embed_query(query)
        chunks = self.vector_store.similarity_search(query_embedding, top_k=top_k)

        if not chunks:
            logger.info(f"No chunks found for query: '{query[:60]}...'")
            return [], True

        best_score = chunks[0]["score"]
        is_fallback = best_score < SIMILARITY_THRESHOLD

        logger.info(
            f"Retrieved {len(chunks)} chunks. Best score: {best_score:.4f}. "
            f"Fallback: {is_fallback}"
        )
        return chunks, is_fallback
