from pathlib import Path
from typing import List, Dict, Any
from parsers.base_parser import BaseParser
from utils.logger import get_logger

logger = get_logger(__name__)


class TXTParser(BaseParser):
    """Parse plain text files."""

    def parse(self, file_path: str) -> List[Dict[str, Any]]:
        filename = Path(file_path).name
        results = []

        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                text = f.read()

            if text.strip():
                results.append(
                    {
                        "text": text.strip(),
                        "metadata": {
                            "filename": filename,
                            "page": 1,
                            "sheet": None,
                        },
                    }
                )
            else:
                logger.warning(f"TXT file is empty: {filename}")

        except Exception as e:
            logger.error(f"Failed to parse TXT {filename}: {e}")
            return []

        logger.info(f"TXT parsed: {filename}")
        return results
