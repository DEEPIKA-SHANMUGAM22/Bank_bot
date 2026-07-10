from pathlib import Path
from typing import List, Dict, Any
from parsers.base_parser import BaseParser
from utils.logger import get_logger

logger = get_logger(__name__)


class CSVParser(BaseParser):
    """Parse CSV files using pandas."""

    def parse(self, file_path: str) -> List[Dict[str, Any]]:
        try:
            import pandas as pd
        except ImportError:
            logger.error("pandas not installed. Run: pip install pandas")
            return []

        filename = Path(file_path).name
        results = []

        try:
            df = pd.read_csv(file_path, encoding="utf-8", on_bad_lines="skip")
            if df.empty:
                logger.warning(f"CSV is empty: {filename}")
                return []

            # Convert each row to text
            rows_text = []
            headers = list(df.columns)
            for _, row in df.iterrows():
                row_str = ", ".join(
                    f"{col}: {val}" for col, val in zip(headers, row.values) if str(val).strip()
                )
                if row_str:
                    rows_text.append(row_str)

            combined = "\n".join(rows_text)
            if combined.strip():
                results.append(
                    {
                        "text": combined.strip(),
                        "metadata": {
                            "filename": filename,
                            "page": 1,
                            "sheet": "Sheet1",
                        },
                    }
                )

        except Exception as e:
            logger.error(f"Failed to parse CSV {filename}: {e}")
            return []

        logger.info(f"CSV parsed: {filename} ({len(results)} blocks)")
        return results
