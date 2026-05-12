"""
Phase 1 Router — /api/v1/upload
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse

from schemas.upload import UploadResponse, ErrorResponse
from services.upload_service import process_upload
from services import store

router = APIRouter(prefix="/api/v1/upload", tags=["Phase 1 — Upload & Preview"])

# Allowed MIME types
ALLOWED_CONTENT_TYPES = {"text/csv", "application/csv", "application/vnd.ms-excel", "text/plain"}
MAX_FILE_SIZE_MB = 50


# ---------------------------------------------------------------------------
# POST /api/v1/upload
# ---------------------------------------------------------------------------
@router.post(
    "/",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a CSV dataset",
    description=(
        "Accepts a CSV file, parses it, infers column types, computes summary stats, "
        "and returns a dataset_id you will use in all subsequent API calls."
    ),
)
async def upload_dataset(file: UploadFile = File(...)):

    # --- Validate file extension ---
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are supported. Please upload a .csv file.",
        )

    # --- Read raw bytes ---
    file_bytes = await file.read()

    # --- Validate file size ---
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size {size_mb:.1f} MB exceeds the {MAX_FILE_SIZE_MB} MB limit.",
        )

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty.",
        )

    # --- Process ---
    try:
        result = process_upload(
            file_bytes=file_bytes,
            file_name=file.filename,
            file_size_bytes=len(file_bytes),
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )

    return result


# ---------------------------------------------------------------------------
# GET /api/v1/upload/{dataset_id}/info
# Re-fetch stats and column info for an already-uploaded dataset
# ---------------------------------------------------------------------------
@router.get(
    "/{dataset_id}/info",
    summary="Get dataset info",
    description="Returns column info and stats for a previously uploaded dataset.",
)
async def get_dataset_info(dataset_id: str):
    df = store.load(dataset_id)
    if df is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset '{dataset_id}' not found. Please upload it again.",
        )

    from services.upload_service import process_upload
    import io
    csv_bytes = df.to_csv(index=False).encode()
    result = process_upload(
        file_bytes=csv_bytes,
        file_name="cached_dataset.csv",
        file_size_bytes=len(csv_bytes),
    )
    # Return same dataset_id (don't create a duplicate)
    result.dataset_id = dataset_id
    return result


# ---------------------------------------------------------------------------
# GET /api/v1/upload/{dataset_id}/preview
# Returns just the preview rows (configurable n)
# ---------------------------------------------------------------------------
@router.get(
    "/{dataset_id}/preview",
    summary="Get dataset preview rows",
    description="Returns the first N rows of the dataset (default 8, max 100).",
)
async def get_preview(dataset_id: str, n: int = 8):
    if n < 1 or n > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="n must be between 1 and 100.",
        )
    df = store.load(dataset_id)
    if df is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset '{dataset_id}' not found.",
        )

    import numpy as np
    preview = df.head(n).replace({np.nan: None}).to_dict(orient="records")
    return {
        "dataset_id": dataset_id,
        "row_count": len(df),
        "preview_rows": len(preview),
        "columns": list(df.columns),
        "preview": preview,
    }


# ---------------------------------------------------------------------------
# DELETE /api/v1/upload/{dataset_id}
# Remove a dataset from memory
# ---------------------------------------------------------------------------
@router.delete(
    "/{dataset_id}",
    summary="Delete a dataset",
    description="Removes the dataset from the in-memory store.",
)
async def delete_dataset(dataset_id: str):
    removed = store.delete(dataset_id)
    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset '{dataset_id}' not found.",
        )
    return {"message": f"Dataset '{dataset_id}' deleted successfully."}
