"""
Onboarding / preferences routes.

`/options` is intentionally unauthenticated -- it only exposes the fixed,
public catalog of supported choices (see app/core/constants.py), never
anything user-specific.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.constants import ASSET_CATALOG, CONTENT_TYPE_CATALOG, INVESTOR_TYPE_CATALOG
from app.db.session import get_db
from app.models.user import User
from app.models.user_preference import UserPreference
from app.schemas.preference import PreferenceOptionsResponse, PreferenceRequest, PreferenceResponse
from app.services import preferences_service

router = APIRouter(tags=["preferences"])


@router.get("/options", response_model=PreferenceOptionsResponse)
def read_preference_options() -> PreferenceOptionsResponse:
    return PreferenceOptionsResponse(
        assets=ASSET_CATALOG,
        investor_types=INVESTOR_TYPE_CATALOG,
        content_types=CONTENT_TYPE_CATALOG,
    )


def _to_response(preference: UserPreference, user: User) -> PreferenceResponse:
    return PreferenceResponse(
        interested_assets=preference.interested_assets,
        investor_type=preference.investor_type,
        content_types=preference.content_types,
        onboarding_completed=user.onboarding_completed,
        updated_at=preference.updated_at,
    )


@router.get("/me", response_model=PreferenceResponse)
def read_my_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PreferenceResponse:
    preference = preferences_service.get_preferences(db, current_user)
    if preference is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Preferences have not been set yet")
    return _to_response(preference, current_user)


@router.put("/me", response_model=PreferenceResponse)
def update_my_preferences(
    data: PreferenceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PreferenceResponse:
    try:
        preference = preferences_service.save_preferences(db, current_user, data)
    except preferences_service.PreferenceSaveError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not save preferences"
        ) from None
    return _to_response(preference, current_user)
