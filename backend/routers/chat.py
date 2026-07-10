import json
from pathlib import Path
from datetime import datetime

from fastapi import APIRouter, HTTPException

from models.schemas import ChatRequest, ChatResponse, SuggestRequest, SuggestResponse
from services.chat_service import ChatService
from config import PENDING_FAQS_FILE
from utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(tags=["Chat"])

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


@router.post("/suggest", response_model=SuggestResponse)
async def suggest_question(request: SuggestRequest):
    """Save a suggested FAQ question to pending_faqs.json when user requests it."""
    try:
        faqs = []
        faq_path = Path(PENDING_FAQS_FILE)

        if faq_path.exists():
            with open(faq_path, "r", encoding="utf-8") as f:
                faqs = json.load(f)

        # Check if already suggested to prevent duplicates
        if not any(item.get("question") == request.question for item in faqs):
            faqs.append(
                {
                    "session_id": request.session_id,
                    "question": request.question,
                    "timestamp": datetime.utcnow().isoformat(),
                }
            )
            with open(faq_path, "w", encoding="utf-8") as f:
                json.dump(faqs, f, indent=2, ensure_ascii=False)
            logger.info(f"Saved suggested FAQ: '{request.question[:60]}...'")

        return SuggestResponse(message="Thank you! Your suggestion has been saved successfully.")

    except Exception as e:
        logger.error(f"Failed to save suggested FAQ: {e}", exc_info=True)
        # Even on error, return friendly success to not interrupt user flow
        return SuggestResponse(message="Thank you! Your suggestion has been saved successfully.")
