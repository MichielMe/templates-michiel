from datetime import timedelta
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.errors import AuthenticationError
from app.core.security import create_access_token
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import UserCreate
from app.services.user import UserService


class AuthService:
    """
    Service for authentication-related operations
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_service = UserService(db)

    async def login(self, username: str, password: str) -> Token:
        """
        Authenticate user and generate access token
        """
        user = await self.user_service.authenticate(username, password)
        if not user:
            raise AuthenticationError("Incorrect username or password")

        if not user.is_active:
            raise AuthenticationError("Inactive user")

        # Generate token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        token = create_access_token(subject=user.id, expires_delta=access_token_expires)

        return Token(access_token=token, token_type="bearer")

    async def register(self, user_data: UserCreate) -> User:
        """
        Register a new user
        """
        return await self.user_service.create(user_data)
