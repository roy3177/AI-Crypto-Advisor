"""
Thumbs-up / thumbs-down feedback: upsert business logic.

Ownership always comes from the authenticated `current_user` passed in by
the route -- never from the request body. The database's unique
constraint on (user_id, section_type, content_key) is the final guarantee
against a duplicate row; this service's own lookup-then-write is not
sufficient on its own under a race, so a lost race is handled by re-
reading and updating the row that won instead of erroring.
"""
import uuid

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.content_feedback import ContentFeedback
from app.models.daily_insight import DailyInsight
from app.models.user import User
from app.schemas.feedback import FeedbackCreate


class InvalidContentKeyError(Exception):
    pass


class ContentNotFoundError(Exception):
    pass


class FeedbackSaveError(Exception):
    pass


def _validate_content_ownership(db: Session, current_user: User, data: FeedbackCreate) -> None:
    try:
        data.validate_prefix_matches_section()
    except ValueError as exc:
        raise InvalidContentKeyError(str(exc)) from exc

    if data.section_type != "ai_insight":
        # Market news, prices, and memes reference external/local catalog
        # content that isn't a private per-user database row -- only the
        # key format is validated above.
        return

    insight_id_str = data.content_key.removeprefix("insight:")
    try:
        insight_id = uuid.UUID(insight_id_str)
    except ValueError:
        raise InvalidContentKeyError("content_key for ai_insight must reference a valid insight id") from None

    insight = db.query(DailyInsight).filter(DailyInsight.id == insight_id).first()
    if insight is None or insight.user_id != current_user.id:
        # Same response for "doesn't exist" and "belongs to someone else"
        # -- never confirm that another user's insight id exists.
        raise ContentNotFoundError("Referenced insight was not found")


def _find_existing(db: Session, current_user: User, section_type: str, content_key: str) -> ContentFeedback | None:
    return (
        db.query(ContentFeedback)
        .filter(
            ContentFeedback.user_id == current_user.id,
            ContentFeedback.section_type == section_type,
            ContentFeedback.content_key == content_key,
        )
        .first()
    )


def upsert_feedback(db: Session, current_user: User, data: FeedbackCreate) -> ContentFeedback:
    _validate_content_ownership(db, current_user, data)

    feedback = _find_existing(db, current_user, data.section_type, data.content_key)
    if feedback is None:
        feedback = ContentFeedback(
            user_id=current_user.id,
            section_type=data.section_type,
            content_key=data.content_key,
            vote=data.vote,
        )
        db.add(feedback)
    else:
        feedback.vote = data.vote

    try:
        db.commit()
    except IntegrityError:
        # Lost a race against a concurrent identical insert -- the other
        # request's row is now the real one; update it instead of failing.
        db.rollback()
        feedback = _find_existing(db, current_user, data.section_type, data.content_key)
        if feedback is None:
            raise FeedbackSaveError("Could not save feedback") from None
        feedback.vote = data.vote
        db.commit()

    db.refresh(feedback)
    return feedback


def list_my_feedback(
    db: Session, current_user: User, section_type: str | None = None, content_key: str | None = None
) -> list[ContentFeedback]:
    query = db.query(ContentFeedback).filter(ContentFeedback.user_id == current_user.id)
    if section_type:
        query = query.filter(ContentFeedback.section_type == section_type)
    if content_key:
        query = query.filter(ContentFeedback.content_key == content_key)
    return query.all()
