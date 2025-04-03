import time
import uuid
from typing import Callable

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.core.config import settings


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for logging request information using loguru
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        start_time = time.time()

        # Log request start
        logger.info(
            f"Request started: {request.method} {request.url.path} (ID: {request_id})"
        )

        # Process the request
        try:
            response = await call_next(request)
            process_time = time.time() - start_time

            # Add custom headers
            response.headers["X-Process-Time"] = str(process_time)
            response.headers["X-Request-ID"] = request_id

            # Log request completion
            logger.info(
                f"Request completed: {request.method} {request.url.path} "
                f"(ID: {request_id}) Status: {response.status_code} "
                f"Time: {process_time:.3f}s"
            )
            return response

        except Exception as e:
            process_time = time.time() - start_time

            # Log request failure
            logger.error(
                f"Request failed: {request.method} {request.url.path} "
                f"(ID: {request_id}) Error: {str(e)} "
                f"Time: {process_time:.3f}s"
            )
            logger.exception(e)
            raise


def setup_middlewares(app: FastAPI) -> None:
    """
    Configure middlewares for the FastAPI application
    """
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Request logging middleware
    app.add_middleware(RequestLoggingMiddleware)
