# @author: Roy Meoded
# @date: 27.08.2026
# @description: SQLAlchemy model for a registered user account.

"""
The `users` table: one row per registered account.

`id` is a UUID rather than a sequential integer so that no API response or
URL ever leaks how many users exist or lets someone guess another user's id
by incrementing a number.
"""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    onboarding_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    preference: Mapped["UserPreference | None"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan", passive_deletes=True
    )
    daily_insights: Mapped[list["DailyInsight"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )
    feedback: Mapped[list["ContentFeedback"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )
