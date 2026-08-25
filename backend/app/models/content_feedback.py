"""
The `content_feedback` table: one row per (user, section, content) vote.

Two constraints protect the feedback rules from CLAUDE.md:
- `ck_content_feedback_vote` only allows -1 or 1 -- never any other number.
- `uq_content_feedback_user_section_content` means a second vote on the same
  content by the same user UPDATES the existing row instead of creating a
  duplicate (the service layer still has to do an upsert; this constraint is
  what makes a duplicate impossible even under a race condition).
"""
import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, SmallInteger, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import SECTION_TYPES
from app.db.base import Base

_section_type_list = ", ".join(f"'{value}'" for value in SECTION_TYPES)


class ContentFeedback(Base):
    __tablename__ = "content_feedback"
    __table_args__ = (
        UniqueConstraint("user_id", "section_type", "content_key", name="uq_content_feedback_user_section_content"),
        CheckConstraint("vote IN (-1, 1)", name="ck_content_feedback_vote"),
        CheckConstraint(f"section_type IN ({_section_type_list})", name="ck_content_feedback_section_type"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    section_type: Mapped[str] = mapped_column(String(50), nullable=False)
    content_key: Mapped[str] = mapped_column(String(255), nullable=False)
    vote: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    content_snapshot: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="feedback")
