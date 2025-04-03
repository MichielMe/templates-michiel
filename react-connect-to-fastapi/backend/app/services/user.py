from typing import Optional

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ConflictError, NotFoundError
from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    """
    Service for user-related operations
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: int) -> Optional[User]:
        """
        Get user by ID
        """
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email
        """
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> Optional[User]:
        """
        Get user by username
        """
        result = await self.db.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()

    async def create(self, user_data: UserCreate) -> User:
        """
        Create a new user
        """
        # Check if user with email already exists
        existing_email = await self.get_by_email(user_data.email)
        if existing_email:
            raise ConflictError(f"User with email {user_data.email} already exists")

        # Check if user with username already exists
        existing_username = await self.get_by_username(user_data.username)
        if existing_username:
            raise ConflictError(
                f"User with username {user_data.username} already exists"
            )

        # Create user object
        db_user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=get_password_hash(user_data.password),
            full_name=user_data.full_name,
            is_active=user_data.is_active,
            is_superuser=False,
        )

        # Add to database
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)

        return db_user

    async def update(self, user_id: int, user_data: UserUpdate) -> User:
        """
        Update a user
        """
        user = await self.get_by_id(user_id)
        if not user:
            raise NotFoundError("User", user_id)

        # Update user fields if provided
        update_data = user_data.model_dump(exclude_unset=True)

        # Handle password update separately
        if "password" in update_data:
            hashed_password = get_password_hash(update_data["password"])
            update_data["hashed_password"] = hashed_password
            del update_data["password"]

        # Update user attributes
        for field, value in update_data.items():
            setattr(user, field, value)

        # Commit changes
        await self.db.commit()
        await self.db.refresh(user)

        return user

    async def delete(self, user_id: int) -> None:
        """
        Delete a user
        """
        user = await self.get_by_id(user_id)
        if not user:
            raise NotFoundError("User", user_id)

        await self.db.delete(user)
        await self.db.commit()

    async def authenticate(self, username: str, password: str) -> Optional[User]:
        """
        Authenticate a user
        """
        user = await self.get_by_username(username)

        if not user:
            return None

        if not verify_password(password, user.hashed_password):
            return None

        return user
