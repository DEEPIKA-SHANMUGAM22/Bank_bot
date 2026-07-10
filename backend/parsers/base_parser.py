from abc import ABC, abstractmethod
from typing import List, Dict, Any


class BaseParser(ABC):
    """Abstract base class for all document parsers."""

    @abstractmethod
    def parse(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Parse a document and return a list of chunks.

        Returns:
            List of dicts: [{"text": str, "metadata": {"filename": str, "page": int, ...}}]
        """
        pass

    def _base_metadata(self, filename: str) -> Dict[str, Any]:
        return {"filename": filename, "page": 1, "sheet": None}
