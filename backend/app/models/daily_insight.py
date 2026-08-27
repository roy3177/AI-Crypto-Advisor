# @author: Roy Meoded
# @date: 27.08.2026
# @description: SQLAlchemy model for one stored AI insight per user per day.

"""
The `daily_insights` table.

The composite unique constraint on (`user_id`, `insight_date`) is what
guarantees "at most one AI insight per user per day" -- the service layer
checks for an existing row first, but this constraint is the real
guarantee if two requests race each other.
"""
import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class DailyInsight(Base):
    __tablename__ = "daily_insights"
    __table_args__ = (UniqueConstraint("user_id", "insight_date", name="uq_daily_insights_user_date"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    insight_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    # Facts given to the AI model (selected assets, prices, headlines, ...) so
    # the insight can be explained later. Never store secrets/API keys here.
    context_snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    model_provider: Mapped[str] = mapped_column(String(50), nullable=False)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship(back_populates="daily_insights")
