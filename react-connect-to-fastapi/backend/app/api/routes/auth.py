from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserResponse
from app.services.auth import AuthService

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)
) -> Token:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    auth_service = AuthService(db)
    return await auth_service.login(form_data.username, form_data.password)


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
async def register(
    user_data: UserCreate, db: AsyncSession = Depends(get_db)
) -> UserResponse:
    """
    Register a new user
    """
    auth_service = AuthService(db)
    user = await auth_service.register(user_data)
    return user
