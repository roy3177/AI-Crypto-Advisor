# @author: Roy Meoded
# @date: 27.08.2026
# @description: Signup, login, and current-user endpoints.

"""
Authentication routes: signup, login, and the current-user lookup.

Handlers stay thin -- they translate between HTTP and the service layer in
`app/services/auth_service.py`, and turn service-layer exceptions into safe,
generic HTTP responses.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.rate_limit import rate_limit
from app.db.session import get_db
from app.models.user import User
from app.schemas.token import TokenResponse
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.services import auth_service

router = APIRouter(tags=["auth"])


@router.post(
    "/signup",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit(5, 3600))],  # 5 signups / hour / IP -- blunts account-spam.
)
def signup(data: UserCreate, db: Session = Depends(get_db)) -> TokenResponse:
    try:
        user = auth_service.signup(db, data)
    except auth_service.EmailAlreadyRegisteredError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered") from None

    return auth_service.build_token_response(user)


@router.post(
    "/login",
    response_model=TokenResponse,
    dependencies=[Depends(rate_limit(10, 300))],  # 10 attempts / 5 min / IP -- blunts brute-force.
)
def login(data: UserLogin, db: Session = Depends(get_db)) -> TokenResponse:
    try:
        user = auth_service.authenticate(db, data)
    except auth_service.InvalidCredentialsError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password") from None
    except auth_service.InactiveUserError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account is disabled") from None

    return auth_service.build_token_response(user)


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current_user)
