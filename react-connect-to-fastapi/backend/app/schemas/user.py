import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    full_name: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = True


# Properties to receive on user creation
class UserCreate(UserBase):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=100)

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v):
        if not re.match(r"^[a-zA-Z0-9_-]+$", v):
            raise ValueError("Username must be alphanumeric with - and _ allowed")
        return v

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        errors = []

        if not re.search(r"[A-Z]", v):
            errors.append("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            errors.append("Password must contain at least one lowercase letter")
        if not re.search(r"[0-9]", v):
            errors.append("Password must contain at least one number")

        if errors:
            raise ValueError(", ".join(errors))

        return v


# Properties to receive on user update
class UserUpdate(UserBase):
    password: Optional[str] = Field(None, min_length=8, max_length=100)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if v is None:
            return v

        errors = []

        if not re.search(r"[A-Z]", v):
            errors.append("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            errors.append("Password must contain at least one lowercase letter")
        if not re.search(r"[0-9]", v):
            errors.append("Password must contain at least one number")

        if errors:
            raise ValueError(", ".join(errors))

        return v


# Properties shared by models returned from API
class UserResponse(UserBase):
    id: int
    username: str
    email: EmailStr
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Additional properties for admin-only responses
class UserAdminResponse(UserResponse):
    is_superuser: bool
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
