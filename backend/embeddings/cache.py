import json
import os
from pathlib import Path
from typing import Optional, List
import numpy as np
from utils.logger import get_logger

logger = get_logger(__name__)

CACHE_DIR = Path("./embedding_cache")
CACHE_DIR.mkdir(exist_ok=True)


class EmbeddingCache:
    """Disk-based embedding cache keyed by file hash."""

    def _cache_path(self, file_hash: str) -> Path:
        return CACHE_DIR / f"{file_hash}.npz"

    def exists(self, file_hash: str) -> bool:
        return self._cache_path(file_hash).exists()

    def save(self, file_hash: str, embeddings: List[List[float]]):
        arr = np.array(embeddings, dtype=np.float32)
        np.savez_compressed(str(self._cache_path(file_hash)), embeddings=arr)
        logger.debug(f"Cached {len(embeddings)} embeddings for hash {file_hash[:8]}...")

    def load(self, file_hash: str) -> Optional[List[List[float]]]:
        path = self._cache_path(file_hash)
        if not path.exists():
            return None
        data = np.load(str(path))
        return data["embeddings"].tolist()

    def delete(self, file_hash: str):
        path = self._cache_path(file_hash)
        if path.exists():
            path.unlink()
            logger.debug(f"Deleted embedding cache for hash {file_hash[:8]}...")
