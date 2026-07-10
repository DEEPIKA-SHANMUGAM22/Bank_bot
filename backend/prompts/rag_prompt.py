from typing import List, Dict, Any


SYSTEM_PROMPT = """You are BankAssist AI, a professional and knowledgeable banking assistant.

STRICT RULES:
1. Answer the user's question using ONLY the provided context below. Do not use external or outside knowledge.
2. If the context does not contain the answer, reply EXACTLY with:
   "I couldn't find this information in the uploaded documents."
3. Make reasonable inferences and connections based on the context (e.g., matching synonyms or related banking concepts) instead of requiring exact keyword matches.
4. Always mention the source document name in your answer (e.g., "According to [document name]...").
5. Be concise, clear, and professional.
6. If the context contains partial information or relevant details, share those details and explain what is available from the document.
7. Format your response in a clear, readable manner (use bullet points or lists when appropriate).
"""


def build_rag_prompt(
    query: str,
    chunks: List[Dict[str, Any]],
    conversation_history: List[Dict[str, str]],
) -> str:
    """
    Build the final RAG prompt including context chunks and conversation history.
    """
    context_parts = []
    for i, chunk in enumerate(chunks, start=1):
        filename = chunk["metadata"].get("filename", "Unknown")
        page = chunk["metadata"].get("page", "N/A")
        sheet = chunk["metadata"].get("sheet")
        source_label = f"Source {i}: {filename}"
        if sheet:
            source_label += f" (Sheet: {sheet})"
        elif page and page != "N/A":
            source_label += f" (Page: {page})"
        context_parts.append(f"[{source_label}]\n{chunk['text']}")

    context_block = "\n\n---\n\n".join(context_parts)

    history_block = ""
    if conversation_history:
        history_lines = []
        for msg in conversation_history[-10:]:
            role = "User" if msg["role"] == "user" else "Assistant"
            history_lines.append(f"{role}: {msg['content']}")
        history_block = "\n".join(history_lines)

    prompt_parts = [SYSTEM_PROMPT, "\n"]

    if history_block:
        prompt_parts.append("CONVERSATION HISTORY:")
        prompt_parts.append(history_block)
        prompt_parts.append("")

    prompt_parts.append("CONTEXT FROM UPLOADED DOCUMENTS:")
    prompt_parts.append(context_block)
    prompt_parts.append("")
    prompt_parts.append(f"USER QUESTION: {query}")
    prompt_parts.append("")
    prompt_parts.append("ANSWER:")

    return "\n".join(prompt_parts)
