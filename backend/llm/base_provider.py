from abc import ABC, abstractmethod


class LLMProvider(ABC):
    """Abstract base class for LLM providers."""

    @abstractmethod
    def generate(self, prompt: str) -> str:
        """Generate a response from a prompt."""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Check if the LLM provider is properly configured."""
        pass
