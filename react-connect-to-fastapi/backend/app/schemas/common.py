from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginationParams(BaseModel):
    """
    Query parameters for pagination
    """

    page: int = Field(1, ge=1, description="Page number")
    limit: int = Field(10, ge=1, le=100, description="Items per page")


class PaginatedResponse(BaseModel, Generic[T]):
    """
    Generic response model for paginated results
    """

    items: List[T]
    total: int
    page: int
    limit: int
    pages: int


class HealthResponse(BaseModel):
    """
    Health check response
    """

    status: str
