from typing import List, Dict, Any, Optional
import chromadb
from config import CHROMA_PERSIST_DIR, CHROMA_COLLECTION_NAME
from utils.logger import get_logger

logger = get_logger(__name__)


class ChromaStore:
    """ChromaDB vector store with persistence."""

    _instance: Optional["ChromaStore"] = None

    def __init__(self):
        logger.info(f"Initializing ChromaDB at: {CHROMA_PERSIST_DIR}")
        self.client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
        self.collection = self.client.get_or_create_collection(
            name=CHROMA_COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
        logger.info(
            f"ChromaDB ready. Collection '{CHROMA_COLLECTION_NAME}' "
            f"has {self.collection.count()} documents."
        )

    @classmethod
    def get_instance(cls) -> "ChromaStore":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @staticmethod
    def _sanitize_metadata(metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        ChromaDB 0.6+ only accepts str, int, float, bool as metadata values.
        Convert None → "" and any other type → str(value).
        """
        clean = {}
        for key, value in metadata.items():
            if isinstance(value, (str, int, float, bool)):
                clean[key] = value
            elif value is None:
                clean[key] = ""
            else:
                clean[key] = str(value)
        return clean

    def add_chunks(
        self,
        chunks: List[Dict[str, Any]],
        embeddings: List[List[float]],
    ):
        """Add chunks with their embeddings to the collection."""
        ids = [chunk["metadata"]["chunk_id"] for chunk in chunks]
        documents = [chunk["text"] for chunk in chunks]
        metadatas = [self._sanitize_metadata(chunk["metadata"]) for chunk in chunks]

        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas,
        )
        logger.info(f"Added {len(chunks)} chunks to ChromaDB.")


    def similarity_search(
        self,
        query_embedding: List[float],
        top_k: int = 5,
    ) -> List[Dict[str, Any]]:
        """Search for similar chunks."""
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=min(top_k, max(self.collection.count(), 1)),
            include=["documents", "metadatas", "distances"],
        )

        chunks = []
        if not results or not results["ids"] or not results["ids"][0]:
            return chunks

        for i, doc_id in enumerate(results["ids"][0]):
            distance = results["distances"][0][i]
            # ChromaDB cosine distance: 0 = identical, 2 = opposite
            # Convert to similarity score: similarity = 1 - (distance / 2)
            similarity = 1.0 - (distance / 2.0)
            chunks.append(
                {
                    "id": doc_id,
                    "text": results["documents"][0][i],
                    "metadata": results["metadatas"][0][i],
                    "score": round(similarity, 4),
                }
            )

        return chunks

    def delete_by_doc_id(self, doc_id: str):
        """Delete all chunks belonging to a document."""
        results = self.collection.get(where={"doc_id": doc_id})
        if results["ids"]:
            self.collection.delete(ids=results["ids"])
            logger.info(f"Deleted {len(results['ids'])} chunks for doc_id={doc_id}")

    def get_all_documents(self) -> List[Dict[str, Any]]:
        """Return unique documents stored in ChromaDB."""
        results = self.collection.get(include=["metadatas"])
        seen = {}
        for meta in results["metadatas"]:
            doc_id = meta.get("doc_id")
            if doc_id and doc_id not in seen:
                seen[doc_id] = meta
        return list(seen.values())

    def document_exists(self, doc_id: str) -> bool:
        results = self.collection.get(where={"doc_id": doc_id}, limit=1)
        return len(results["ids"]) > 0

    def count(self) -> int:
        return self.collection.count()

    def is_connected(self) -> bool:
        try:
            self.collection.count()
            return True
        except Exception:
            return False
