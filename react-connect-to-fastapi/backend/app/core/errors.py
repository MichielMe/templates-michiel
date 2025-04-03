from typing import Any, Dict, List, Optional

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from loguru import logger
from pydantic import BaseModel
from sqlalchemy.exc import SQLAlchemyError


class ErrorResponse(BaseModel):
    error: str
    message: str
    details: Optional[List[Dict[str, Any]]] = None


class AppException(Exception):
    """
    Base exception class for application errors
    """

    def __init__(self, status_code: int, error_code: str, message: str):
        self.status_code = status_code
        self.error_code = error_code
        self.message = message


class NotFoundError(AppException):
    """
    Resource not found error
    """

    def __init__(self, resource_type: str, resource_id: Any):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="not_found",
            message=f"{resource_type} with id {resource_id} not found",
        )


class AuthenticationError(AppException):
    """
    Authentication-related errors
    """

    def __init__(self, message: str = "Authentication failed"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="authentication_error",
            message=message,
        )


class PermissionDeniedError(AppException):
    """
    Permission/authorization errors
    """

    def __init__(self, message: str = "Permission denied"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="permission_denied",
            message=message,
        )


class ConflictError(AppException):
    """
    Resource conflict errors (e.g., unique constraint violation)
    """

    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            error_code="conflict_error",
            message=message,
        )


def make_serializable(obj: Any) -> Any:
    """
    Recursively convert an object to a JSON serializable type.
    Handles nested dicts, lists, and exceptions.
    """
    if isinstance(obj, dict):
        return {k: make_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [make_serializable(item) for item in obj]
    elif isinstance(obj, tuple):
        return tuple(make_serializable(item) for item in obj)
    elif isinstance(obj, Exception):
        return str(obj)
    elif hasattr(obj, "__dict__"):  # Handle custom objects
        return str(obj)
    else:
        return obj


def setup_exception_handlers(app: FastAPI) -> None:
    """
    Configure exception handlers for the FastAPI application
    """

    @app.exception_handler(AppException)
    async def handle_app_exception(request: Request, exc: AppException) -> JSONResponse:
        logger.warning(f"Application exception: {exc.error_code} - {exc.message}")
        return JSONResponse(
            status_code=exc.status_code,
            content=ErrorResponse(
                error=exc.error_code, message=exc.message
            ).model_dump(),
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        # Get validation errors and make them serializable
        raw_errors = exc.errors()

        # Make the entire error structure serializable
        errors = make_serializable(raw_errors)

        logger.warning(f"Validation error: {errors}")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=ErrorResponse(
                error="validation_error",
                message="Validation error",
                details=errors,
            ).model_dump(),
        )

    @app.exception_handler(SQLAlchemyError)
    async def handle_db_error(request: Request, exc: SQLAlchemyError) -> JSONResponse:
        logger.error(f"Database error: {str(exc)}")
        logger.exception(exc)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=ErrorResponse(
                error="database_error", message="A database error occurred"
            ).model_dump(),
        )

    @app.exception_handler(Exception)
    async def handle_generic_error(request: Request, exc: Exception) -> JSONResponse:
        logger.error(f"Unhandled exception: {str(exc)}")
        logger.exception(exc)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=ErrorResponse(
                error="server_error", message="An unexpected error occurred"
            ).model_dump(),
        )
