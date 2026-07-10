import os
import shutil
from pathlib import Path
from typing import List

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

from services.ingestion_service import IngestionService
from models.schemas import UploadResponse, DocumentMetadata
from config import UPLOAD_DIR, MAX_FILE_SIZE_MB
from parsers.parser_factory import supported_extensions
from utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()

MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024
ALLOWED_EXTENSIONS = set(supported_extensions())

# Singleton ingestion service
_ingestion_service = None


def get_ingestion_service() -> IngestionService:
    global _ingestion_service
    if _ingestion_service is None:
        _ingestion_service = IngestionService()
    return _ingestion_service


@router.post("/upload", response_model=UploadResponse)
async def upload_documents(files: List[UploadFile] = File(...)):
    """Upload and ingest multiple documents."""
    service = get_ingestion_service()
    uploaded = []
    failed = []
    duplicates = []

    for upload_file in files:
        filename = upload_file.filename or "unknown"
        ext = Path(filename).suffix.lower()

        # Validate extension
        if ext not in ALLOWED_EXTENSIONS:
            failed.append(
                {"filename": filename, "reason": f"Unsupported file type: {ext}"}
            )
            continue

        # Read content
        content = await upload_file.read()

        # Validate size
        if len(content) > MAX_FILE_SIZE:
            failed.append(
                {
                    "filename": filename,
                    "reason": f"File exceeds {MAX_FILE_SIZE_MB}MB limit.",
                }
            )
            continue

        # Save temporarily
        save_path = Path(UPLOAD_DIR) / filename
        try:
            with open(save_path, "wb") as f:
                f.write(content)
        except Exception as e:
            failed.append({"filename": filename, "reason": f"Failed to save file: {e}"})
            continue

        # Ingest
        success, message, metadata = service.ingest_file(str(save_path), filename)

        if not success:
            if message == "duplicate":
                duplicates.append(filename)
            else:
                failed.append({"filename": filename, "reason": message})
                # Clean up failed file
                if save_path.exists():
                    save_path.unlink()
        else:
            uploaded.append(
                DocumentMetadata(
                    doc_id=metadata["doc_id"],
                    filename=metadata["filename"],
                    file_hash=metadata.get("file_hash"),
                    upload_timestamp=metadata.get("upload_timestamp"),
                    page_count=metadata.get("page_count"),
                    chunk_count=metadata.get("chunk_count"),
                    file_size_bytes=metadata.get("file_size_bytes"),
                    file_type=metadata.get("file_type"),
                )
            )

    return UploadResponse(uploaded=uploaded, failed=failed, duplicates=duplicates)
