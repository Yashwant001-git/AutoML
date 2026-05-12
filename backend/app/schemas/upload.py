from pydantic import BaseModel
from typing import Any


class ColumnInfo(BaseModel):
    name: str
    dtype: str          # "numeric" | "string" | "boolean" | "datetime" | "unknown"
    pandas_dtype: str   # raw pandas dtype string e.g. "int64", "object"
    null_count: int
    null_pct: float     # 0.0 – 100.0
    unique_count: int


class DatasetStats(BaseModel):
    row_count: int
    col_count: int
    numeric_col_count: int
    categorical_col_count: int
    boolean_col_count: int
    datetime_col_count: int
    total_null_count: int
    total_null_pct: float
    duplicate_row_count: int
    memory_kb: float


class UploadResponse(BaseModel):
    dataset_id: str
    file_name: str
    file_size_kb: float
    stats: DatasetStats
    columns: list[ColumnInfo]
    preview: list[dict[str, Any]]   # first 8 rows as list of dicts
    message: str


class ErrorResponse(BaseModel):
    detail: str
