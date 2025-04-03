from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.deps import CurrentActiveUser, CurrentSuperUser
from app.models.user import User
from app.schemas.user import UserAdminResponse, UserResponse, UserUpdate
from app.services.user import UserService

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user(current_user: CurrentActiveUser) -> User:
    """
    Get current user
    """
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_data: UserUpdate,
    current_user: CurrentActiveUser,
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Update current user
    """
    user_service = UserService(db)
    return await user_service.update(current_user.id, user_data)


@router.get("/{user_id}", response_model=UserAdminResponse)
async def get_user_by_id(
    user_id: int = Path(..., ge=1),
    _: User = Depends(CurrentSuperUser),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Get a specific user by id, admin only
    """
    user_service = UserService(db)
    return await user_service.get_by_id(user_id)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int = Path(..., ge=1),
    _: User = Depends(CurrentSuperUser),
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Delete a user, admin only
    """
    user_service = UserService(db)
    await user_service.delete(user_id)
