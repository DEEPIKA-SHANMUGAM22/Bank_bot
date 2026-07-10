import os
import shutil
from pathlib import Path
from typing import List, Dict, Any

from vectorstore.chroma_store import ChromaStore
from utils.logger import get_logger
from config import UPLOAD_DIR
from models.schemas import DocumentMetadata

logger = get_logger(__name__)


class DocumentService:
    """Manages documents stored in ChromaDB and on disk."""

    def __init__(self):
        self.vector_store = ChromaStore.get_instance()

    def list_documents(self) -> List[Dict[str, Any]]:
        """Return all unique documents with metadata."""
        raw_docs = self.vector_store.get_all_documents()
        result = []
        for meta in raw_docs:
            result.append(
                {
                    "doc_id": meta.get("doc_id", ""),
                    "filename": meta.get("filename", "Unknown"),
                    "file_hash": meta.get("file_hash", ""),
                    "upload_timestamp": meta.get("upload_timestamp", ""),
                    "page_count": meta.get("page_count"),
                    "chunk_count": None,  # Would need a count query
                    "file_size_bytes": meta.get("file_size_bytes"),
                    "file_type": meta.get("file_type", ""),
                }
            )
        return result

    def delete_document(self, doc_id: str) -> bool:
        """Delete a document from ChromaDB and the uploads folder."""
        try:
            # Find document metadata to get filename
            docs = self.vector_store.get_all_documents()
            filename = None
            for doc in docs:
                if doc.get("doc_id") == doc_id:
                    filename = doc.get("filename")
                    break

            if not self.vector_store.document_exists(doc_id):
                logger.warning(f"Document not found: doc_id={doc_id}")
                return False

            # Delete from ChromaDB
            self.vector_store.delete_by_doc_id(doc_id)

            # Delete file from disk if found
            if filename:
                upload_path = Path(UPLOAD_DIR) / filename
                if upload_path.exists():
                    upload_path.unlink()
                    logger.info(f"Deleted file: {upload_path}")

            logger.info(f"Deleted document: doc_id={doc_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to delete document {doc_id}: {e}", exc_info=True)
            return False
