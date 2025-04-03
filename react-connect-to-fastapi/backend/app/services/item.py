from typing import Dict, List, Optional, Tuple

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundError, PermissionDeniedError
from app.models.item import Item
from app.models.user import User
from app.schemas.common import PaginationParams
from app.schemas.item import ItemCreate, ItemUpdate


class ItemService:
    """
    Service for item-related operations
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, item_id: int) -> Optional[Item]:
        """
        Get item by ID
        """
        result = await self.db.execute(select(Item).where(Item.id == item_id))
        return result.scalar_one_or_none()

    async def get_items(
        self, pagination: PaginationParams, owner_id: Optional[int] = None
    ) -> Tuple[List[Item], int]:
        """
        Get paginated list of items, optionally filtered by owner
        """
        # Base query
        query = select(Item)

        # Add owner filter if provided
        if owner_id is not None:
            query = query.where(Item.owner_id == owner_id)

        # Count total items
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.scalar(count_query) or 0

        # Apply pagination
        skip = (pagination.page - 1) * pagination.limit
        query = query.offset(skip).limit(pagination.limit)

        # Execute query
        result = await self.db.execute(query)
        items = result.scalars().all()

        return items, total

    async def create(self, item_data: ItemCreate, owner_id: int) -> Item:
        """
        Create a new item
        """
        db_item = Item(
            title=item_data.title, description=item_data.description, owner_id=owner_id
        )

        self.db.add(db_item)
        await self.db.commit()
        await self.db.refresh(db_item)

        return db_item

    async def update(
        self, item_id: int, item_data: ItemUpdate, current_user: User
    ) -> Item:
        """
        Update an item
        """
        # Get item
        item = await self.get_by_id(item_id)
        if not item:
            raise NotFoundError("Item", item_id)

        # Check if user is owner or superuser
        if item.owner_id != current_user.id and not current_user.is_superuser:
            raise PermissionDeniedError(
                "You do not have permission to update this item"
            )

        # Update item fields
        update_data = item_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(item, field, value)

        # Commit changes
        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def delete(self, item_id: int, current_user: User) -> None:
        """
        Delete an item
        """
        # Get item
        item = await self.get_by_id(item_id)
        if not item:
            raise NotFoundError("Item", item_id)

        # Check if user is owner or superuser
        if item.owner_id != current_user.id and not current_user.is_superuser:
            raise PermissionDeniedError(
                "You do not have permission to delete this item"
            )

        # Delete item
        await self.db.delete(item)
        await self.db.commit()

    async def bulk_delete(
        self, item_ids: List[int], current_user: User
    ) -> Dict[str, List[int]]:
        """
        Delete multiple items at once

        Args:
            item_ids: List of item IDs to delete
            current_user: Current user performing the operation

        Returns:
            Dictionary with successfully deleted IDs and failed IDs
        """
        deleted_ids = []
        failed_ids = []

        for item_id in item_ids:
            try:
                # Get item
                item = await self.get_by_id(item_id)

                # Skip if item not found
                if not item:
                    failed_ids.append(item_id)
                    continue

                # Check if user is owner or superuser
                if item.owner_id != current_user.id and not current_user.is_superuser:
                    failed_ids.append(item_id)
                    continue

                # Delete item
                await self.db.delete(item)
                deleted_ids.append(item_id)

            except Exception:
                # Add to failed if any exception occurs
                failed_ids.append(item_id)

        # Commit all successful deletions at once
        if deleted_ids:
            await self.db.commit()

        return {"deleted_ids": deleted_ids, "failed_ids": failed_ids}
