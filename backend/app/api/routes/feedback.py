# @author: Roy Meoded
# @date: 27.08.2026
# @description: Endpoints for upserting and listing the authenticated user's thumbs-up/down feedback.

"""
Feedback routes: PUT /api/feedback (upsert a vote), GET /api/feedback/me
(list the authenticated user's own votes, optionally filtered).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.feedback import FeedbackCreate, FeedbackResponse
from app.services import feedback_service

router = APIRouter(tags=["feedback"])


@router.put("", response_model=FeedbackResponse)
def upsert_feedback(
    data: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FeedbackResponse:
    try:
        feedback = feedback_service.upsert_feedback(db, current_user, data)
    except feedback_service.InvalidContentKeyError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from None
    except feedback_service.ContentNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from None
    except feedback_service.FeedbackSaveError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not save feedback"
        ) from None
    return FeedbackResponse.model_validate(feedback)


@router.get("/me", response_model=list[FeedbackResponse])
def read_my_feedback(
    section_type: str | None = None,
    content_key: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[FeedbackResponse]:
    rows = feedback_service.list_my_feedback(db, current_user, section_type, content_key)
    return [FeedbackResponse.model_validate(row) for row in rows]
