from pathlib import Path
from typing import List, Dict, Any
from parsers.base_parser import BaseParser
from utils.logger import get_logger

logger = get_logger(__name__)


class XLSXParser(BaseParser):
    """Parse XLSX files using pandas + openpyxl."""

    def parse(self, file_path: str) -> List[Dict[str, Any]]:
        try:
            import pandas as pd
        except ImportError:
            logger.error("pandas not installed. Run: pip install pandas openpyxl")
            return []

        filename = Path(file_path).name
        results = []

        try:
            xl = pd.ExcelFile(file_path, engine="openpyxl")
            sheet_names = xl.sheet_names

            for sheet_name in sheet_names:
                try:
                    df = xl.parse(sheet_name)
                    if df.empty:
                        continue

                    headers = list(df.columns)
                    rows_text = []
                    for _, row in df.iterrows():
                        row_str = ", ".join(
                            f"{col}: {val}"
                            for col, val in zip(headers, row.values)
                            if str(val).strip() and str(val).lower() != "nan"
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
                                    "sheet": sheet_name,
                                },
                            }
                        )
                except Exception as e:
                    logger.warning(f"Error parsing sheet '{sheet_name}' in {filename}: {e}")

        except Exception as e:
            logger.error(f"Failed to parse XLSX {filename}: {e}")
            return []

        logger.info(f"XLSX parsed: {filename} ({len(results)} sheets)")
        return results
