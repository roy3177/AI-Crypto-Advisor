"""
Import every model here so that:
1. Alembic's autogenerate can see the full schema via `Base.metadata`.
2. SQLAlchemy can resolve the string-based relationship references
   (e.g. `Mapped["User"]`) between models defined in separate files.
"""
from app.models.content_feedback import ContentFeedback
from app.models.daily_insight import DailyInsight
from app.models.user import User
from app.models.user_preference import UserPreference

__all__ = ["User", "UserPreference", "DailyInsight", "ContentFeedback"]
