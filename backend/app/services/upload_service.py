"""
Phase 1 — Upload Service
Handles CSV parsing and produces all stats/column info/preview data.
"""

import io
import uuid
import math
import pandas as pd
import numpy as np

from schemas.upload import ColumnInfo, DatasetStats, UploadResponse
from services import store


# ---------------------------------------------------------------------------
# Type inference
# ---------------------------------------------------------------------------

def _infer_type(series: pd.Series) -> str:
    """
    Map a pandas Series to one of: numeric, boolean, datetime, string, unknown.
    """
    if pd.api.types.is_bool_dtype(series):
        return "boolean"

    if pd.api.types.is_numeric_dtype(series):
        return "numeric"

    if pd.api.types.is_datetime64_any_dtype(series):
        return "datetime"

    # Try to cast object columns to numeric / datetime
    non_null = series.dropna()
    if len(non_null) == 0:
        return "unknown"

    # Check boolean-like string values
    bool_vals = {"true", "false", "yes", "no", "1", "0", "t", "f"}
    if non_null.astype(str).str.lower().isin(bool_vals).mean() > 0.85:
        return "boolean"

    # Check numeric
    numeric_converted = pd.to_numeric(non_null, errors="coerce")
    if numeric_converted.notna().mean() > 0.85:
        return "numeric"

    # Check datetime
    try:
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            pd.to_datetime(non_null.sample(min(50, len(non_null))))
        return "datetime"
    except Exception:
        pass

    return "string"


# ---------------------------------------------------------------------------
# Main service function
# ---------------------------------------------------------------------------

def process_upload(file_bytes: bytes, file_name: str, file_size_bytes: int) -> UploadResponse:
    """
    Parse a CSV file and return full Phase 1 response.
    Raises ValueError for invalid / non-CSV content.
    """
    # --- Parse ---
    try:
        df = pd.read_csv(io.BytesIO(file_bytes))
    except Exception as exc:
        raise ValueError(f"Could not parse CSV: {exc}") from exc

    if df.empty:
        raise ValueError("The uploaded CSV file is empty.")

    # Strip leading/trailing whitespace from column names
    df.columns = df.columns.str.strip()

    # --- Dataset ID & persist ---
    dataset_id = str(uuid.uuid4())
    store.save(dataset_id, df)

    # --- Column info ---
    columns: list[ColumnInfo] = []
    for col in df.columns:
        series = df[col]
        inferred = _infer_type(series)
        null_count = int(series.isna().sum())
        null_pct = round(null_count / len(df) * 100, 2) if len(df) else 0.0
        unique_count = int(series.nunique(dropna=False))

        columns.append(ColumnInfo(
            name=col,
            dtype=inferred,
            pandas_dtype=str(series.dtype),
            null_count=null_count,
            null_pct=null_pct,
            unique_count=unique_count,
        ))

    # --- Stats ---
    dtype_map = {c.name: c.dtype for c in columns}
    numeric_cols   = [c for c in columns if c.dtype == "numeric"]
    cat_cols       = [c for c in columns if c.dtype == "string"]
    bool_cols      = [c for c in columns if c.dtype == "boolean"]
    datetime_cols  = [c for c in columns if c.dtype == "datetime"]
    total_nulls    = int(df.isna().sum().sum())
    total_cells    = df.size
    memory_kb      = round(df.memory_usage(deep=True).sum() / 1024, 2)
    dup_rows       = int(df.duplicated().sum())

    stats = DatasetStats(
        row_count=len(df),
        col_count=len(df.columns),
        numeric_col_count=len(numeric_cols),
        categorical_col_count=len(cat_cols),
        boolean_col_count=len(bool_cols),
        datetime_col_count=len(datetime_cols),
        total_null_count=total_nulls,
        total_null_pct=round(total_nulls / total_cells * 100, 2) if total_cells else 0.0,
        duplicate_row_count=dup_rows,
        memory_kb=memory_kb,
    )

    # --- Preview: first 8 rows, NaN → None for JSON serialisation ---
    preview_df = df.head(8).replace({np.nan: None})
    preview = preview_df.to_dict(orient="records")

    return UploadResponse(
        dataset_id=dataset_id,
        file_name=file_name,
        file_size_kb=round(file_size_bytes / 1024, 2),
        stats=stats,
        columns=columns,
        preview=preview,
        message="Dataset uploaded and processed successfully.",
    )