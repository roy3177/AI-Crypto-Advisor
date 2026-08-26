"""
Daily AI insight route.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.insight import DailyInsightResponse
from app.services import insight_service, preferences_service

router = APIRouter(tags=["insights"])


@router.get("/daily", response_model=DailyInsightResponse)
async def read_daily_insight(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DailyInsightResponse:
    preference = preferences_service.get_preferences(db, current_user)
    if preference is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Preferences have not been set yet")

    return await insight_service.get_or_create_daily_insight(db, current_user, preference)
