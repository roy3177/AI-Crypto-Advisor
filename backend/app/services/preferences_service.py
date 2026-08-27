# @author: Roy Meoded
# @date: 27.08.2026
# @description: Business logic for saving onboarding preferences atomically with onboarding_completed.

"""
Onboarding / preferences business logic.

`save_preferences` is the one place that implements the atomic-onboarding
rule from CLAUDE.md: the preference upsert and `User.onboarding_completed`
are written in the same SQLAlchemy session and committed together, so a
failure part-way through leaves neither change applied.
"""
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.user_preference import UserPreference
from app.schemas.preference import PreferenceRequest


class PreferenceSaveError(Exception):
    pass


def get_preferences(db: Session, user: User) -> UserPreference | None:
    return db.query(UserPreference).filter(UserPreference.user_id == user.id).first()


def save_preferences(db: Session, user: User, data: PreferenceRequest) -> UserPreference:
    preference = get_preferences(db, user)
    if preference is None:
        preference = UserPreference(user_id=user.id)
        db.add(preference)

    preference.interested_assets = data.interested_assets
    preference.investor_type = data.investor_type
    preference.content_types = data.content_types
    user.onboarding_completed = True

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise PreferenceSaveError("Could not save preferences") from None

    db.refresh(preference)
    db.refresh(user)
    return preference
