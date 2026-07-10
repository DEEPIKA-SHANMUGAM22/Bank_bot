from typing import Dict, Any, List

from retriever.retriever import Retriever
from llm.gemini_provider import GeminiProvider
from prompts.rag_prompt import build_rag_prompt
from utils.session_manager import session_manager
from utils.logger import get_logger
from models.schemas import ChatResponse, SourceDocument

logger = get_logger(__name__)

FALLBACK_MESSAGE = "I couldn't find this information in the uploaded documents."
FOLLOW_UP_MESSAGE = (
    "\n\nWould you like to suggest this question to be added to our knowledge base?"
)


class ChatService:
    """Handles the full RAG chat pipeline."""

    def __init__(self):
        self.retriever = Retriever()
        self.llm = GeminiProvider.get_instance()

    def chat(self, session_id: str, message: str) -> ChatResponse:
        """
        Process a user message and return a response.

        Pipeline:
        1. Retrieve relevant chunks
        2. Check fallback threshold
        3. Build prompt with history
        4. Generate LLM response
        5. Update session history
        6. Return structured response
        """
        logger.info(f"Chat request: session={session_id}, message='{message[:60]}...'")

        # Get conversation history
        history = session_manager.get_history(session_id)

        # Retrieve
        chunks, is_fallback = self.retriever.retrieve(message)

        # Build sources
        sources = []
        for chunk in chunks:
            meta = chunk.get("metadata", {})
            chunk_text = chunk.get("text", "")
            sources.append(
                SourceDocument(
                    document=meta.get("filename", "Unknown"),
                    page=meta.get("page"),
                    sheet=meta.get("sheet") or None,
                    score=chunk.get("score", 0.0),
                    chunk_id=meta.get("chunk_id"),
                    chunk_index=meta.get("chunk_index"),
                    text=chunk_text[:200] if chunk_text else None,
                )
            )

        # Fallback handling
        if is_fallback or not chunks:
            answer = FALLBACK_MESSAGE + FOLLOW_UP_MESSAGE
            session_manager.add_message(session_id, "user", message)
            session_manager.add_message(session_id, "assistant", answer)
            return ChatResponse(
                answer=answer,
                sources=[],
                is_fallback=True,
                session_id=session_id,
            )

        # Build RAG prompt
        prompt = build_rag_prompt(message, chunks, history)

        # Log retrieved context and final prompt for debugging
        logger.info(f"--- RETRIEVED CONTEXT FOR QUERY: '{message}' ---")
        for idx, chunk in enumerate(chunks):
            meta = chunk.get("metadata", {})
            logger.info(
                f"Chunk {idx+1} | Document: {meta.get('filename')} | Score: {chunk.get('score', 0.0):.4f} | "
                f"Snippet: {chunk.get('text', '')[:100]}..."
            )
        logger.info(f"--- GENERATION PROMPT PASSED TO GEMINI ---\n{prompt}\n-----------------------------------------")

        # Generate response
        answer = self.llm.generate(prompt)


        # Update session history
        session_manager.add_message(session_id, "user", message)
        session_manager.add_message(session_id, "assistant", answer)

        return ChatResponse(
            answer=answer,
            sources=sources,
            is_fallback=False,
            session_id=session_id,
        )
