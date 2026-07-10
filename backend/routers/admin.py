import os
import json
import shutil
from pathlib import Path
from typing import List, Dict
from datetime import datetime

from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import JSONResponse

from services.ingestion_service import IngestionService
from services.document_service import DocumentService
from models.schemas import UploadResponse, DocumentMetadata, DeleteResponse, ApproveQuestionRequest
from config import UPLOAD_DIR, MAX_FILE_SIZE_MB, PENDING_FAQS_FILE
from parsers.parser_factory import supported_extensions
from utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/admin", tags=["Admin"])

MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024
ALLOWED_EXTENSIONS = set(supported_extensions())

# Singleton services
_ingestion_service = None
_doc_service = None


def get_ingestion_service() -> IngestionService:
    global _ingestion_service
    if _ingestion_service is None:
        _ingestion_service = IngestionService()
    return _ingestion_service


def get_doc_service() -> DocumentService:
    global _doc_service
    if _doc_service is None:
        _doc_service = DocumentService()
    return _doc_service


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


@router.get("/documents")
async def list_documents():
    """Return all uploaded documents with metadata."""
    service = get_doc_service()
    try:
        docs = service.list_documents()
        return {"documents": docs, "total": len(docs)}
    except Exception as e:
        logger.error(f"Error listing documents: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/documents/{doc_id}", response_model=DeleteResponse)
async def delete_document(doc_id: str):
    """Delete a document from the knowledge base."""
    service = get_doc_service()
    success = service.delete_document(doc_id)
    if not success:
        raise HTTPException(
            status_code=404, detail=f"Document with id '{doc_id}' not found."
        )
    return DeleteResponse(message="Document deleted successfully.", doc_id=doc_id)


@router.get("/pending-questions")
async def list_pending_questions():
    """List all user-suggested pending questions."""
    faq_path = Path(PENDING_FAQS_FILE)
    if not faq_path.exists():
        return []
    try:
        with open(faq_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to read pending FAQs: {e}", exc_info=True)
        return []


@router.post("/pending-questions/approve")
async def approve_pending_question(req: ApproveQuestionRequest):
    """Approve a question by creating a new Q&A FAQ file and ingesting it."""
    try:
        # Create a text file containing the Q&A
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        safe_q = "".join([c if c.isalnum() else "_" for c in req.question[:20]])
        filename = f"approved_faq_{safe_q}_{timestamp}.txt"
        file_path = Path(UPLOAD_DIR) / filename

        content = f"Q: {req.question}\nA: {req.answer}\n"
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)

        # Ingest the newly created FAQ document
        service = get_ingestion_service()
        success, message, metadata = service.ingest_file(str(file_path), filename)

        if not success:
            if file_path.exists():
                file_path.unlink()
            raise HTTPException(status_code=500, detail=f"Failed to ingest approved FAQ: {message}")

        # Remove from pending list
        faq_path = Path(PENDING_FAQS_FILE)
        if faq_path.exists():
            with open(faq_path, "r", encoding="utf-8") as f:
                faqs = json.load(f)
            # Filter out matches (by exact question string)
            updated_faqs = [item for item in faqs if item.get("question") != req.question]
            with open(faq_path, "w", encoding="utf-8") as f:
                json.dump(updated_faqs, f, indent=2, ensure_ascii=False)

        return {"status": "success", "message": "Question approved and ingested into knowledge base.", "metadata": metadata}
    except Exception as e:
        logger.error(f"Error approving pending question: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/pending-questions")
async def reject_pending_question(question: str = Query(..., description="The exact question text to reject")):
    """Reject/dismiss a pending user question."""
    faq_path = Path(PENDING_FAQS_FILE)
    if not faq_path.exists():
        raise HTTPException(status_code=404, detail="No pending questions found.")
    try:
        with open(faq_path, "r", encoding="utf-8") as f:
            faqs = json.load(f)

        updated_faqs = [item for item in faqs if item.get("question") != question]

        with open(faq_path, "w", encoding="utf-8") as f:
            json.dump(updated_faqs, f, indent=2, ensure_ascii=False)

        return {"status": "success", "message": "Pending question rejected and removed."}
    except Exception as e:
        logger.error(f"Failed to delete pending question: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
