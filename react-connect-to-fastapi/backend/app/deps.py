from typing import Annotated, Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.db import get_db
from app.core.errors import AuthenticationError, PermissionDeniedError
from app.models.user import User
from app.schemas.token import TokenPayload
from app.services.user import UserService

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    """
    Dependency to get current authenticated user
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (jwt.JWTError, ValidationError):
        raise AuthenticationError("Could not validate credentials")

    # Check if user_id exists in payload
    if token_data.user_id is None:
        raise AuthenticationError("Could not validate credentials")

    # Get user from database
    user_service = UserService(db)
    user = await user_service.get_by_id(token_data.user_id)

    if not user:
        raise AuthenticationError("User not found")

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency to get current active user
    """
    if not current_user.is_active:
        raise AuthenticationError("Inactive user")
    return current_user


async def get_current_superuser(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Dependency to get current superuser
    """
    if not current_user.is_superuser:
        raise PermissionDeniedError("Superuser privileges required")
    return current_user


# Type annotations for user dependencies
CurrentUser = Annotated[User, Depends(get_current_user)]
CurrentActiveUser = Annotated[User, Depends(get_current_active_user)]
CurrentSuperUser = Annotated[User, Depends(get_current_superuser)]
