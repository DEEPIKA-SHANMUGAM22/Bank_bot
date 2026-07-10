from google import genai
from google.genai import types as genai_types
from llm.base_provider import LLMProvider
from config import GEMINI_API_KEY, GEMINI_MODEL
from utils.logger import get_logger

logger = get_logger(__name__)

FALLBACK_RESPONSE = "I couldn't find this information in the uploaded documents."


class GeminiProvider(LLMProvider):
    """Google Gemini LLM provider using the new google-genai SDK."""

    _instance = None

    def __init__(self):
        if not GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY not set. LLM calls will fail.")
            self._configured = False
            return

        try:
            self.client = genai.Client(api_key=GEMINI_API_KEY)
            self._model = GEMINI_MODEL
            self._config = genai_types.GenerateContentConfig(
                temperature=0.2,
                top_p=0.8,
                top_k=40,
                max_output_tokens=1024,
            )
            self._configured = True
            logger.info(f"Gemini provider initialized with model: {GEMINI_MODEL}")
        except Exception as e:
            logger.error(f"Failed to configure Gemini: {e}")
            self._configured = False

    @classmethod
    def get_instance(cls) -> "GeminiProvider":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def is_available(self) -> bool:
        return self._configured

    def generate(self, prompt: str) -> str:
        """Generate a response from Gemini."""
        if not self._configured:
            logger.error("Gemini is not configured. Cannot generate response.")
            return FALLBACK_RESPONSE

        try:
            response = self.client.models.generate_content(
                model=self._model,
                contents=prompt,
                config=self._config,
            )
            text = response.text
            if text:
                return text.strip()
            logger.warning("Gemini returned empty response.")
            return FALLBACK_RESPONSE
        except Exception as e:
            logger.error(f"Gemini generation error: {e}")
            return FALLBACK_RESPONSE
