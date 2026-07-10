from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse
from services.chat_service import ChatService
from utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()

_chat_service = None


def get_chat_service() -> ChatService:
    global _chat_service
    if _chat_service is None:
        _chat_service = ChatService()
    return _chat_service


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process a chat message and return a RAG-powered response."""
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    service = get_chat_service()
    try:
        response = service.chat(request.session_id, request.message.strip())
        return response
    except Exception as e:
        logger.error(f"Chat error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Chat processing error: {str(e)}")
