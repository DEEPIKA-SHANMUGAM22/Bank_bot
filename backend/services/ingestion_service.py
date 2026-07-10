import os
import uuid
import shutil
from pathlib import Path
from typing import List, Dict, Any, Tuple
from datetime import datetime

from parsers.parser_factory import get_parser
from chunking.text_splitter import TextSplitter
from embeddings.embedding_service import EmbeddingService
from vectorstore.chroma_store import ChromaStore
from utils.file_hash import compute_file_hash
from utils.logger import get_logger
from models.schemas import DocumentMetadata
from config import UPLOAD_DIR

logger = get_logger(__name__)


class IngestionService:
    """Handles the full document ingestion pipeline."""

    def __init__(self):
        self.splitter = TextSplitter()
        self.embedding_service = EmbeddingService.get_instance()
        self.vector_store = ChromaStore.get_instance()
        self._hash_to_doc: Dict[str, str] = {}  # file_hash -> doc_id

    def ingest_file(
        self, file_path: str, original_filename: str
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Full ingestion pipeline for a single file.

        Returns:
            (success, message, metadata_dict)
        """
        try:
            file_hash = compute_file_hash(file_path)

            # Check for duplicates
            existing_docs = self.vector_store.get_all_documents()
            for doc_meta in existing_docs:
                if doc_meta.get("file_hash") == file_hash:
                    return (
                        False,
                        "duplicate",
                        {"filename": original_filename, "file_hash": file_hash},
                    )

            # Parse
            parser = get_parser(file_path)
            if parser is None:
                return False, f"Unsupported file type: {Path(file_path).suffix}", {}

            pages = parser.parse(file_path)
            if not pages:
                return False, "File is empty or could not be parsed.", {}

            # Generate doc_id
            doc_id = str(uuid.uuid4())

            # Chunk
            chunks = self.splitter.split(pages, doc_id)
            if not chunks:
                return False, "No text could be extracted from file.", {}

            # Add file_hash and file_size to each chunk's metadata
            file_size = os.path.getsize(file_path)
            file_ext = Path(original_filename).suffix.lower()
            for chunk in chunks:
                chunk["metadata"]["file_hash"] = file_hash
                chunk["metadata"]["file_size_bytes"] = file_size
                chunk["metadata"]["file_type"] = file_ext

            # Embed
            texts = [chunk["text"] for chunk in chunks]
            embeddings = self.embedding_service.embed_texts(texts, file_hash=file_hash)

            # Store
            self.vector_store.add_chunks(chunks, embeddings)

            metadata = {
                "doc_id": doc_id,
                "filename": original_filename,
                "file_hash": file_hash,
                "upload_timestamp": datetime.utcnow().isoformat(),
                "page_count": len(pages),
                "chunk_count": len(chunks),
                "file_size_bytes": file_size,
                "file_type": file_ext,
            }

            logger.info(
                f"Ingested '{original_filename}': {len(chunks)} chunks, doc_id={doc_id}"
            )
            return True, "success", metadata

        except Exception as e:
            logger.error(f"Ingestion failed for '{original_filename}': {e}", exc_info=True)
            return False, str(e), {}
