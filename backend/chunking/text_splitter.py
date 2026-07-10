from typing import List, Dict, Any
from langchain_text_splitters import RecursiveCharacterTextSplitter
from config import CHUNK_SIZE, CHUNK_OVERLAP
from utils.logger import get_logger
import uuid
from datetime import datetime

logger = get_logger(__name__)


class TextSplitter:
    """Recursively splits text into chunks with metadata."""

    def __init__(self, chunk_size: int = CHUNK_SIZE, chunk_overlap: int = CHUNK_OVERLAP):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ". ", "! ", "? ", ", ", " ", ""],
        )

    def split(self, pages: List[Dict[str, Any]], doc_id: str) -> List[Dict[str, Any]]:
        """
        Split parsed pages into chunks.

        Args:
            pages: List of {"text": str, "metadata": {...}}
            doc_id: Unique document identifier

        Returns:
            List of chunk dicts with enriched metadata
        """
        chunks = []
        upload_ts = datetime.utcnow().isoformat()

        for page in pages:
            text = page.get("text", "").strip()
            metadata = page.get("metadata", {})

            if not text:
                continue

            split_texts = self.splitter.split_text(text)

            for idx, chunk_text in enumerate(split_texts):
                if not chunk_text.strip():
                    continue

                chunk_id = str(uuid.uuid4())
                chunk_meta = {
                    **metadata,
                    "chunk_id": chunk_id,
                    "doc_id": doc_id,
                    "chunk_index": idx,
                    "upload_timestamp": upload_ts,
                }
                chunks.append({"text": chunk_text.strip(), "metadata": chunk_meta})

        logger.info(f"Split into {len(chunks)} chunks for doc_id={doc_id}")
        return chunks
