from app.schemas.common import HealthResponse
from fastapi import APIRouter

router = APIRouter()


@router.get("/", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Health check endpoint
    """
    return HealthResponse(status="ok")
