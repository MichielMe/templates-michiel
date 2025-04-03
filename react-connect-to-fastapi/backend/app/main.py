from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_router
from app.core.config import settings
from app.core.errors import setup_exception_handlers
from app.core.init_db import init_db
from app.core.middleware import setup_middlewares


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for the FastAPI application
    Handles startup and shutdown events
    """
    # Startup: Initialize database
    await init_db()

    yield

    # Shutdown: Clean up resources if needed
    # (no cleanup needed for this app)


def create_application() -> FastAPI:
    """
    Create and configure the FastAPI application
    """
    # Create FastAPI app
    app = FastAPI(
        title=settings.PROJECT_NAME,
        openapi_url=settings.OPENAPI_URL,
        docs_url=settings.DOCS_URL,
        redoc_url=settings.REDOC_URL,
        lifespan=lifespan,
    )

    # Setup exception handlers
    setup_exception_handlers(app)

    # Setup middlewares
    setup_middlewares(app)

    # Include API router
    app.include_router(api_router, prefix=settings.API_V1_STR)

    return app


app = create_application()


@app.get("/")
async def root():
    """
    Root endpoint - redirects to docs
    """
    return {"message": "Welcome to FastAPI Backend API", "docs": "/docs"}
