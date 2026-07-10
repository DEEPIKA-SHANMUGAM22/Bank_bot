from pathlib import Path
from typing import List, Dict, Any
from parsers.base_parser import BaseParser
from utils.logger import get_logger

logger = get_logger(__name__)


class PDFParser(BaseParser):
    """Parse PDF files using pdfplumber."""

    def parse(self, file_path: str) -> List[Dict[str, Any]]:
        try:
            import pdfplumber
        except ImportError:
            logger.error("pdfplumber not installed. Run: pip install pdfplumber")
            return []

        filename = Path(file_path).name
        results = []

        try:
            with pdfplumber.open(file_path) as pdf:
                if not pdf.pages:
                    logger.warning(f"PDF has no pages: {filename}")
                    return []

                for page_num, page in enumerate(pdf.pages, start=1):
                    try:
                        text = page.extract_text()
                        if text and text.strip():
                            results.append(
                                {
                                    "text": text.strip(),
                                    "metadata": {
                                        "filename": filename,
                                        "page": page_num,
                                        "sheet": None,
                                    },
                                }
                            )
                    except Exception as e:
                        logger.warning(f"Error extracting page {page_num} from {filename}: {e}")

        except Exception as e:
            logger.error(f"Failed to parse PDF {filename}: {e}")
            return []

        logger.info(f"PDF parsed: {filename} ({len(results)} pages extracted)")
        return results
