# @author: Roy Meoded
# @date: 27.08.2026
# @description: Pydantic request/response schemas for onboarding preferences.

"""
Pydantic schemas for onboarding / user preferences.

Validation here mirrors the database CHECK constraint on `investor_type` in
`app/models/user_preference.py`: an invalid value is rejected with a clear
422 error before it ever reaches the database, but the database constraint
remains the final guarantee against a bug bypassing this layer.
"""
from datetime import datetime

from pydantic import BaseModel, field_validator

from app.core.constants import CONTENT_TYPES, INVESTOR_TYPES, SUPPORTED_ASSETS


def _dedupe_preserving_order(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        if value not in seen:
            seen.add(value)
            result.append(value)
    return result


class PreferenceRequest(BaseModel):
    """Body for `PUT /api/preferences/me`. Note there is no `user_id` field --
    ownership always comes from the authenticated request, never the body."""

    interested_assets: list[str]
    investor_type: str
    content_types: list[str]

    @field_validator("interested_assets")
    @classmethod
    def validate_assets(cls, value: list[str]) -> list[str]:
        value = _dedupe_preserving_order(value)
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
        value = _dedupe_preserving_order(value)
        if not value:
            raise ValueError("Select at least one content category.")
        unknown = sorted(set(value) - set(CONTENT_TYPES))
        if unknown:
            raise ValueError(f"Unsupported content type(s): {', '.join(unknown)}")
        return value


class PreferenceResponse(BaseModel):
    interested_assets: list[str]
    investor_type: str
    content_types: list[str]
    onboarding_completed: bool
    updated_at: datetime


class OptionItem(BaseModel):
    id: str
    label: str
    symbol: str | None = None


class PreferenceOptionsResponse(BaseModel):
    assets: list[OptionItem]
    investor_types: list[OptionItem]
    content_types: list[OptionItem]
