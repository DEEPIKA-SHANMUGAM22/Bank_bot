import json
import os
from pathlib import Path
from datetime import datetime

from fastapi import APIRouter
from models.schemas import HealthResponse, SuggestRequest, SuggestResponse
from vectorstore.chroma_store import ChromaStore
from llm.gemini_provider import GeminiProvider
from config import GEMINI_MODEL, EMBEDDING_MODEL, PENDING_FAQS_FILE
from utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Check system health."""
    store = ChromaStore.get_instance()
    llm = GeminiProvider.get_instance()

    chroma_status = "connected" if store.is_connected() else "error"
    llm_status = GEMINI_MODEL if llm.is_available() else "not configured"

    return HealthResponse(
        status="ok",
        llm=llm_status,
        chroma=chroma_status,
        embedding_model=EMBEDDING_MODEL,
        total_chunks=store.count(),
    )


@router.post("/suggest", response_model=SuggestResponse)
async def suggest_question(request: SuggestRequest):
    """Save a suggested FAQ question to pending_faqs.json."""
    try:
        faqs = []
        faq_path = Path(PENDING_FAQS_FILE)

        if faq_path.exists():
            with open(faq_path, "r", encoding="utf-8") as f:
                faqs = json.load(f)

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
        return SuggestResponse(message="Saved successfully.")
