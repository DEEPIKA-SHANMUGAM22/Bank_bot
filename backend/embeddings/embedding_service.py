from typing import List, Optional
from sentence_transformers import SentenceTransformer
from embeddings.cache import EmbeddingCache
from config import EMBEDDING_MODEL
from utils.logger import get_logger

logger = get_logger(__name__)


class EmbeddingService:
    """Embedding service using sentence-transformers with disk caching."""

    _instance: Optional["EmbeddingService"] = None

    def __init__(self):
        logger.info(f"Loading embedding model: {EMBEDDING_MODEL}")
        self.model = SentenceTransformer(EMBEDDING_MODEL)
        self.cache = EmbeddingCache()
        logger.info("Embedding model loaded successfully.")

    @classmethod
    def get_instance(cls) -> "EmbeddingService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def embed_texts(
        self, texts: List[str], file_hash: Optional[str] = None
    ) -> List[List[float]]:
        """
        Embed a list of texts. Uses cache if file_hash provided and cache exists.
        """
        if file_hash and self.cache.exists(file_hash):
            cached = self.cache.load(file_hash)
            if cached and len(cached) == len(texts):
                logger.info(f"Cache hit for file_hash={file_hash[:8]}...")
                return cached

        logger.info(f"Generating embeddings for {len(texts)} chunks...")
        embeddings = self.model.encode(
            texts, batch_size=32, show_progress_bar=False, convert_to_numpy=True
        )
        result = embeddings.tolist()

        if file_hash:
            self.cache.save(file_hash, result)

        return result

    def embed_query(self, text: str) -> List[float]:
        """Embed a single query string."""
        embedding = self.model.encode([text], convert_to_numpy=True)
        return embedding[0].tolist()
