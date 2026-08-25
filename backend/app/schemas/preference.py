"""
Pydantic schemas for onboarding / user preferences.

Validation here mirrors the database CHECK constraints in
`app/models/user_preference.py`: an invalid value is rejected with a clear
400 error before it ever reaches the database, but the database constraint
remains the final guarantee.
"""
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

from app.core.constants import CONTENT_TYPES, INVESTOR_TYPES, SUPPORTED_ASSETS


class UserPreferenceBase(BaseModel):
    interested_assets: list[str]
    investor_type: str
    content_types: list[str]

    @field_validator("interested_assets")
    @classmethod
    def validate_assets(cls, value: list[str]) -> list[str]:
        if not value:
            raise ValueError("Select at least one crypto asset.")
        unknown = sorted(set(value) - set(SUPPORTED_ASSETS))
        if unknown:
            raise ValueError(f"Unsupported asset(s): {', '.join(unknown)}")
        return value

    @field_validator("investor_type")
    @classmethod
    def validate_investor_type(cls, value: str) -> str:
        if value not in INVESTOR_TYPES:
            raise ValueError(f"Unsupported investor type: {value}")
        return value

    @field_validator("content_types")
    @classmethod
    def validate_content_types(cls, value: list[str]) -> list[str]:
        if not value:
            raise ValueError("Select at least one content type.")
        unknown = sorted(set(value) - set(CONTENT_TYPES))
        if unknown:
            raise ValueError(f"Unsupported content type(s): {', '.join(unknown)}")
        return value


class UserPreferenceCreate(UserPreferenceBase):
    pass


class UserPreferenceUpdate(UserPreferenceBase):
    pass


class UserPreferenceResponse(UserPreferenceBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
