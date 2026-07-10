from fastapi import APIRouter, HTTPException
from typing import List

from services.document_service import DocumentService
from models.schemas import DeleteResponse
from utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()

_doc_service = None


def get_doc_service() -> DocumentService:
    global _doc_service
    if _doc_service is None:
        _doc_service = DocumentService()
    return _doc_service


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
