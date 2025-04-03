from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


# Shared properties
class ItemBase(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None


# Properties to receive on item creation
class ItemCreate(ItemBase):
    title: str = Field(..., min_length=1, max_length=255)


# Properties to receive on item update
class ItemUpdate(ItemBase):
    pass


# Properties shared by models returned from API
class ItemResponse(ItemBase):
    id: int
    title: str
    owner_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Properties to return with expanded owner information
class ItemDetailResponse(ItemResponse):
    description: Optional[str] = None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Request for bulk delete operation
class BulkDeleteRequest(BaseModel):
    ids: List[int] = Field(..., description="List of item IDs to delete")


# Response for bulk delete operation
class BulkDeleteResponse(BaseModel):
    deleted_ids: List[int] = Field(
        default_factory=list, description="IDs that were successfully deleted"
    )
    failed_ids: List[int] = Field(
        default_factory=list, description="IDs that failed to delete"
    )
