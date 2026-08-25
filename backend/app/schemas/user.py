"""
Pydantic schemas for the User entity.

These are separate from the SQLAlchemy `User` model on purpose: the model
describes the database table, these describe what the API accepts and
returns. `password_hash` never appears in any schema here, so it can never
be serialized into an API response by accident.
"""
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    email: str
    onboarding_completed: bool
    created_at: datetime
