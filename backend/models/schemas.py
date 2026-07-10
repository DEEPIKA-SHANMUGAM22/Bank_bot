from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime


class ChatRequest(BaseModel):
    session_id: str = Field(..., description="Unique session UUID")
    message: str = Field(..., min_length=1, max_length=2000)


class SourceDocument(BaseModel):
    document: str
    page: Optional[int] = None
    sheet: Optional[str] = None
    score: float
    chunk_id: Optional[str] = None
    chunk_index: Optional[int] = None
    text: Optional[str] = None          # first ~200 chars of chunk for label extraction


class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceDocument] = []
    is_fallback: bool = False
    session_id: str


class DocumentMetadata(BaseModel):
    doc_id: str
    filename: str
    file_hash: Optional[str] = None
    upload_timestamp: Optional[str] = None
    page_count: Optional[int] = None
    chunk_count: Optional[int] = None
    file_size_bytes: Optional[int] = None
    file_type: Optional[str] = None


class UploadResponse(BaseModel):
    uploaded: List[DocumentMetadata] = []
    failed: List[Dict[str, str]] = []
    duplicates: List[str] = []


class DeleteResponse(BaseModel):
    message: str
    doc_id: str


class SuggestRequest(BaseModel):
    session_id: str
    question: str


class SuggestResponse(BaseModel):
    message: str


class HealthResponse(BaseModel):
    status: str
    llm: str
    chroma: str
    embedding_model: str
    total_chunks: int


class ApproveQuestionRequest(BaseModel):
    question: str
    answer: str

