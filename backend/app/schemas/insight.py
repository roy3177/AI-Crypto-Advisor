"""
Pydantic schema for the AI insight returned to the client.

Only the fields the frontend actually needs are exposed. `context_snapshot`,
`model_provider`, and `model_name` stay internal (useful for debugging /
review) and are not part of the public response.
"""
import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class DailyInsightResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    insight_date: date
    content: str
    created_at: datetime
