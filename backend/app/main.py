"""
AI-Powered Data Science Platform
Phase 1 Backend — FastAPI Application
"""

import sys
import os

# Ensure the app directory is on sys.path so sub-modules (routers, services,
# schemas) are importable no matter which working directory uvicorn is launched from.
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.upload import router as upload_router

# ---------------------------------------------------------------------------
# App instance
# ---------------------------------------------------------------------------
app = FastAPI(
    title="DataSci Platform API",
    description=(
        "AI-powered automated data science platform. "
        "Phase 1 covers dataset upload, type inference, stats, and preview."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS — allow all origins during development
# Restrict to your frontend domain in production
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(upload_router)


# ---------------------------------------------------------------------------
# Root health check
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "ok",
        "platform": "DataSci Platform API",
        "version": "1.0.0",
        "phase": "Phase 1 — Upload & Preview",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}