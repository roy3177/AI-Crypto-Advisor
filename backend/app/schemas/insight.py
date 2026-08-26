"""
Response schema for the daily AI insight.

`id` and `model_provider` are `None` for a non-persisted fallback (the
skill's rule: a temporary fallback must never be written to
`daily_insights` as if it were the user's real saved insight for the day).
`content_key` is likewise `None` for a fallback -- there is nothing
persisted to attach feedback to, so the frontend must not show feedback
controls when it is absent.
"""
import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel

DISCLAIMER = "This content is for informational purposes only and is not financial advice."

FIXED_TITLE = "Your daily crypto insight"


class DailyInsightResponse(BaseModel):
    id: uuid.UUID | None
    date: date
    title: str
    content: str
    disclaimer: str = DISCLAIMER
    source: Literal["ai", "fallback"]
    model_provider: str | None = None
    generated_at: datetime
    content_key: str | None = None
