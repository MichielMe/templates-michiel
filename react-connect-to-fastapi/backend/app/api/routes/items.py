from typing import Optional

from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.deps import CurrentActiveUser
from app.models.user import User
from app.schemas.common import PaginatedResponse, PaginationParams
from app.schemas.item import (
    BulkDeleteRequest,
    BulkDeleteResponse,
    ItemCreate,
    ItemDetailResponse,
    ItemResponse,
    ItemUpdate,
)
from app.services.item import ItemService

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[ItemResponse])
async def list_items(
    pagination: PaginationParams = Depends(),
    owner_id: Optional[int] = Query(None, description="Filter items by owner"),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse:
    """
    List items with pagination and filtering
    """
    item_service = ItemService(db)
    items, total = await item_service.get_items(pagination, owner_id)

    # Calculate total pages
    pages = (total + pagination.limit - 1) // pagination.limit

    return PaginatedResponse(
        items=items,
        total=total,
        page=pagination.page,
        limit=pagination.limit,
        pages=pages,
    )


@router.post("/", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(
    item_data: ItemCreate,
    current_user: CurrentActiveUser,
    db: AsyncSession = Depends(get_db),
) -> ItemResponse:
    """
    Create a new item
    """
    item_service = ItemService(db)
    return await item_service.create(item_data, current_user.id)


@router.get("/{item_id}", response_model=ItemDetailResponse)
async def get_item(
    item_id: int = Path(..., ge=1), db: AsyncSession = Depends(get_db)
) -> ItemDetailResponse:
    """
    Get a specific item by id
    """
    item_service = ItemService(db)
    return await item_service.get_by_id(item_id)


@router.put("/{item_id}", response_model=ItemDetailResponse)
async def update_item(
    item_data: ItemUpdate,
    current_user: CurrentActiveUser,
    item_id: int = Path(..., ge=1),
    db: AsyncSession = Depends(get_db),
) -> ItemDetailResponse:
    """
    Update an item
    """
    item_service = ItemService(db)
    return await item_service.update(item_id, item_data, current_user)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    current_user: CurrentActiveUser,
    item_id: int = Path(..., ge=1),
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Delete an item
    """
    item_service = ItemService(db)
    await item_service.delete(item_id, current_user)


@router.post(
    "/bulk-delete", response_model=BulkDeleteResponse, status_code=status.HTTP_200_OK
)
async def bulk_delete_items(
    request: BulkDeleteRequest,
    current_user: CurrentActiveUser,
    db: AsyncSession = Depends(get_db),
) -> BulkDeleteResponse:
    """
    Delete multiple items at once

    Returns information about which items were successfully deleted and which failed
    """
    item_service = ItemService(db)
    result = await item_service.bulk_delete(request.ids, current_user)

    return BulkDeleteResponse(
        deleted_ids=result["deleted_ids"], failed_ids=result["failed_ids"]
    )
