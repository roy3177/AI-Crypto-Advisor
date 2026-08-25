"""
The `user_preferences` table: one row per user, holding onboarding answers.

The unique constraint on `user_id` is what enforces "at most one preference
record per user" at the database level -- the application must never rely
on application-code checks alone for this rule (a race condition between
two requests could otherwise create two rows).
"""
import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import INVESTOR_TYPES
from app.db.base import Base

_investor_type_list = ", ".join(f"'{value}'" for value in INVESTOR_TYPES)


class UserPreference(Base):
    __tablename__ = "user_preferences"
    __table_args__ = (
        CheckConstraint(f"investor_type IN ({_investor_type_list})", name="ck_user_preferences_investor_type"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    # Stable CoinGecko asset identifiers (e.g. "bitcoin"), not display labels.
    interested_assets: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    investor_type: Mapped[str] = mapped_column(String(50), nullable=False)
    content_types: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="preference")
