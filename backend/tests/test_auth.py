"""
Authentication tests, run against the FastAPI app through HTTP (via the
`client` fixture) so they exercise the real request/response cycle, not
just the service functions directly.
"""
import uuid
from datetime import datetime, timedelta, timezone

import jwt
import pytest

from app.core.config import get_settings
from app.core.security import ACCESS_TOKEN_TYPE, create_access_token, hash_password
from app.models.user import User

settings = get_settings()


def unique_email() -> str:
    return f"user-{uuid.uuid4().hex[:12]}@example.com"


def signup_payload(email: str | None = None, **overrides) -> dict:
    payload = {"name": "Test User", "email": email or unique_email(), "password": "correct-horse"}
    payload.update(overrides)
    return payload


class TestSignup:
    def test_valid_signup_creates_user(self, client):
        response = client.post("/api/auth/signup", json=signup_payload())
        assert response.status_code == 201
        body = response.json()
        assert body["user"]["onboarding_completed"] is False
        assert "access_token" in body
        assert body["token_type"] == "bearer"

    def test_signup_response_never_contains_password_hash(self, client):
        response = client.post("/api/auth/signup", json=signup_payload())
        body = response.json()
        assert "password_hash" not in body["user"]
        assert "password" not in body["user"]

    def test_email_is_normalized(self, client, db_session):
        email = f"  Mixed-{uuid.uuid4().hex[:8]}@Example.COM  "
        response = client.post("/api/auth/signup", json=signup_payload(email=email))
        assert response.status_code == 201
        assert response.json()["user"]["email"] == email.strip().lower()

        stored = db_session.query(User).filter(User.email == email.strip().lower()).first()
        assert stored is not None

    def test_password_is_stored_hashed_not_plaintext(self, client, db_session):
        email = unique_email()
        client.post("/api/auth/signup", json=signup_payload(email=email, password="correct-horse"))
        stored = db_session.query(User).filter(User.email == email).first()
        assert stored.password_hash != "correct-horse"
        assert stored.password_hash.startswith("$2b$")

    def test_duplicate_email_is_rejected(self, client):
        email = unique_email()
        first = client.post("/api/auth/signup", json=signup_payload(email=email))
        assert first.status_code == 201
        second = client.post("/api/auth/signup", json=signup_payload(email=email))
        assert second.status_code == 409

    def test_invalid_email_is_rejected(self, client):
        response = client.post("/api/auth/signup", json=signup_payload(email="not-an-email"))
        assert response.status_code == 422

    def test_blank_name_is_rejected(self, client):
        response = client.post("/api/auth/signup", json=signup_payload(name=""))
        assert response.status_code == 422

    def test_short_password_is_rejected(self, client):
        response = client.post("/api/auth/signup", json=signup_payload(password="short"))
        assert response.status_code == 422


class TestLogin:
    def test_valid_credentials_return_access_token(self, client):
        email = unique_email()
        client.post("/api/auth/signup", json=signup_payload(email=email, password="correct-horse"))

        response = client.post("/api/auth/login", json={"email": email, "password": "correct-horse"})
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_incorrect_password_is_rejected(self, client):
        email = unique_email()
        client.post("/api/auth/signup", json=signup_payload(email=email, password="correct-horse"))

        response = client.post("/api/auth/login", json={"email": email, "password": "wrong-password"})
        assert response.status_code == 401

    def test_unknown_email_is_rejected(self, client):
        response = client.post("/api/auth/login", json={"email": unique_email(), "password": "whatever1"})
        assert response.status_code == 401

    def test_login_does_not_reveal_which_field_was_wrong(self, client):
        email = unique_email()
        client.post("/api/auth/signup", json=signup_payload(email=email, password="correct-horse"))

        wrong_password = client.post("/api/auth/login", json={"email": email, "password": "wrong-password"})
        unknown_email = client.post("/api/auth/login", json={"email": unique_email(), "password": "whatever1"})
        assert wrong_password.json()["detail"] == unknown_email.json()["detail"]

    def test_login_normalizes_email_case(self, client):
        email = unique_email()
        client.post("/api/auth/signup", json=signup_payload(email=email, password="correct-horse"))

        response = client.post("/api/auth/login", json={"email": email.upper(), "password": "correct-horse"})
        assert response.status_code == 200

    def test_inactive_user_is_rejected(self, client, db_session):
        email = unique_email()
        client.post("/api/auth/signup", json=signup_payload(email=email, password="correct-horse"))
        user = db_session.query(User).filter(User.email == email).first()
        user.is_active = False
        db_session.flush()

        response = client.post("/api/auth/login", json={"email": email, "password": "correct-horse"})
        assert response.status_code == 403


class TestJWTValidation:
    def _signed_up_user(self, client, db_session):
        email = unique_email()
        client.post("/api/auth/signup", json=signup_payload(email=email, password="correct-horse"))
        return db_session.query(User).filter(User.email == email).first()

    def test_valid_token_is_accepted(self, client, db_session):
        user = self._signed_up_user(client, db_session)
        token = create_access_token(subject=str(user.id))

        response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert response.json()["email"] == user.email

    def test_missing_token_is_rejected(self, client):
        response = client.get("/api/auth/me")
        assert response.status_code == 401

    def test_invalid_signature_is_rejected(self, client, db_session):
        user = self._signed_up_user(client, db_session)
        bad_token = jwt.encode(
            {"sub": str(user.id), "type": ACCESS_TOKEN_TYPE, "iat": 0, "exp": 9999999999},
            "a-completely-different-secret",
            algorithm=settings.jwt_algorithm,
        )
        response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {bad_token}"})
        assert response.status_code == 401

    def test_expired_token_is_rejected(self, client, db_session):
        user = self._signed_up_user(client, db_session)
        past = datetime.now(timezone.utc) - timedelta(hours=1)
        expired_token = jwt.encode(
            {
                "sub": str(user.id),
                "type": ACCESS_TOKEN_TYPE,
                "iat": int((past - timedelta(minutes=1)).timestamp()),
                "exp": int(past.timestamp()),
            },
            settings.jwt_secret,
            algorithm=settings.jwt_algorithm,
        )
        response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
        assert response.status_code == 401

    def test_token_without_subject_is_rejected(self, client):
        token = jwt.encode(
            {"type": ACCESS_TOKEN_TYPE, "iat": 0, "exp": 9999999999},
            settings.jwt_secret,
            algorithm=settings.jwt_algorithm,
        )
        response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 401

    def test_token_with_wrong_type_is_rejected(self, client, db_session):
        user = self._signed_up_user(client, db_session)
        token = jwt.encode(
            {"sub": str(user.id), "type": "refresh", "iat": 0, "exp": 9999999999},
            settings.jwt_secret,
            algorithm=settings.jwt_algorithm,
        )
        response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 401

    def test_token_for_missing_user_is_rejected(self, client):
        token = create_access_token(subject=str(uuid.uuid4()))
        response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 401

    def test_token_for_inactive_user_is_rejected(self, client, db_session):
        user = self._signed_up_user(client, db_session)
        token = create_access_token(subject=str(user.id))
        user.is_active = False
        db_session.flush()

        response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 403
