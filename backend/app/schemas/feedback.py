"""
Pydantic schemas for thumbs-up / thumbs-down feedback.

There is no `user_id` field on `FeedbackCreate` on purpose: ownership must
come from the authenticated request (the JWT), never from a value the
frontend sends -- see CLAUDE.md's feedback rules.
"""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, field_validator

from app.core.constants import SECTION_TYPES


class FeedbackCreate(BaseModel):
    section_type: str
    content_key: str
    vote: Literal[1, -1]

    @field_validator("section_type")
    @classmethod
    def validate_section_type(cls, value: str) -> str:
        if value not in SECTION_TYPES:
            raise ValueError(f"Unsupported section type: {value}")
        return value


class FeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    section_type: str
    content_key: str
    vote: int
    updated_at: datetime
