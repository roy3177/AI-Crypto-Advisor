# @author: Roy Meoded
# @date: 27.08.2026
# @description: Business logic for signup, login, and password verification.

"""
Authentication business logic.

Kept out of the route handlers so `app/api/routes/auth.py` stays thin, and
so this logic can be unit-tested without going through HTTP.
"""
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.token import TokenResponse
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.core.config import get_settings

settings = get_settings()


class EmailAlreadyRegisteredError(Exception):
    pass


class InvalidCredentialsError(Exception):
    """Deliberately generic: covers both 'unknown email' and 'wrong password'
    so the API response never reveals which one it was."""


class InactiveUserError(Exception):
    pass


def normalize_email(email: str) -> str:
    return email.strip().lower()


def signup(db: Session, data: UserCreate) -> User:
    email = normalize_email(data.email)

    user = User(name=data.name.strip(), email=email, password_hash=hash_password(data.password))
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise EmailAlreadyRegisteredError(f"Email already registered: {email}") from None

    db.refresh(user)
    return user


def authenticate(db: Session, data: UserLogin) -> User:
    email = normalize_email(data.email)
    user = db.query(User).filter(User.email == email).first()

    # Run verify_password even when no user was found (against a fixed dummy
    # hash) so a login attempt for a nonexistent email takes roughly the same
    # time as one for a real email with a wrong password. This avoids letting
    # an attacker learn whether an email exists just by measuring response time.
    dummy_hash = "$2b$12$CwTycUXWue0Thq9StjUM0uJ8G4NLpVvL3Vd9F5Xy9Qw2j0y5s1uS."
    password_ok = verify_password(data.password, user.password_hash if user else dummy_hash)

    if not user or not password_ok:
        raise InvalidCredentialsError("Invalid email or password")

    if not user.is_active:
        raise InactiveUserError("This account is disabled")

    return user


def build_token_response(user: User) -> TokenResponse:
    token = create_access_token(subject=str(user.id))
    return TokenResponse(
        access_token=token,
        expires_in=settings.jwt_expire_minutes * 60,
        user=UserResponse.model_validate(user),
    )
