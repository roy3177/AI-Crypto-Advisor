# @author: Roy Meoded
# @date: 27.08.2026
# @description: Password hashing (bcrypt) and JWT creation/validation utilities.

"""
Password hashing and JWT handling -- the only place in the codebase that
should touch either.

Routes and services call these functions instead of hashing passwords or
encoding/decoding tokens themselves, so there is exactly one place to
review for authentication security.
"""
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from pydantic import BaseModel

from app.core.config import get_settings

settings = get_settings()

ACCESS_TOKEN_TYPE = "access"

# bcrypt only looks at the first 72 bytes of a password; anything after that
# is silently ignored by the algorithm itself. We truncate explicitly (and
# identically in hash and verify) so behavior is predictable instead of
# relying on that implicit cutoff.
_MAX_PASSWORD_BYTES = 72


def _prepare(password: str) -> bytes:
    return password.encode("utf-8")[:_MAX_PASSWORD_BYTES]


def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(_prepare(password), bcrypt.gensalt())
    return hashed.decode("ascii")


def verify_password(plain_password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(_prepare(plain_password), password_hash.encode("ascii"))
    except ValueError:
        # Malformed/unrecognized hash -- treat as "does not match" rather
        # than raising, so a corrupted row can never crash the login route.
        return False


class TokenPayload(BaseModel):
    sub: str
    type: str
    iat: int
    exp: int


class InvalidTokenError(Exception):
    """Raised for any JWT problem (bad signature, expired, wrong type, ...).

    Routes catch this single exception type and turn it into a generic
    401 response, instead of leaking which specific check failed.
    """


def create_access_token(subject: str) -> str:
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {
        "sub": subject,
        "type": ACCESS_TOKEN_TYPE,
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> TokenPayload:
    try:
        raw_payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except jwt.PyJWTError as exc:
        raise InvalidTokenError("Invalid or expired token") from exc

    if raw_payload.get("type") != ACCESS_TOKEN_TYPE:
        raise InvalidTokenError("Unexpected token type")

    if not raw_payload.get("sub"):
        raise InvalidTokenError("Token is missing a subject")

    return TokenPayload(**raw_payload)
