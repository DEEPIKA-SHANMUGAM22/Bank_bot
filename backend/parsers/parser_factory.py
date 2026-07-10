from pathlib import Path
from typing import Optional
from parsers.base_parser import BaseParser
from parsers.pdf_parser import PDFParser
from parsers.docx_parser import DOCXParser
from parsers.txt_parser import TXTParser
from parsers.csv_parser import CSVParser
from parsers.xlsx_parser import XLSXParser
from utils.logger import get_logger

logger = get_logger(__name__)

PARSER_MAP = {
    ".pdf": PDFParser,
    ".docx": DOCXParser,
    ".doc": DOCXParser,
    ".txt": TXTParser,
    ".csv": CSVParser,
    ".xlsx": XLSXParser,
    ".xls": XLSXParser,
}


def get_parser(file_path: str) -> Optional[BaseParser]:
    """Return appropriate parser based on file extension."""
    ext = Path(file_path).suffix.lower()
    parser_cls = PARSER_MAP.get(ext)
    if parser_cls is None:
        logger.warning(f"No parser found for extension: {ext}")
        return None
    return parser_cls()


def supported_extensions() -> list:
    return list(PARSER_MAP.keys())
