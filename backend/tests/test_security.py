"""
Security-hardening tests: the login/signup rate limiter and the
production JWT-secret startup check. Neither depends on a real database,
so these run even when no DATABASE_URL is reachable.
"""
import pytest

from app.core.config import Settings, get_settings
from app.core.rate_limit import _limiter as auth_rate_limiter


class TestLoginRateLimit:
    def test_allows_requests_up_to_the_limit(self, client):
        # The login route allows 10 attempts / 5 minutes / IP -- wrong
        # credentials still count as a request and should return 401, not
        # 429, until the limit is actually exceeded.
        for _ in range(10):
            response = client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "wrong"})
            assert response.status_code == 401

    def test_blocks_once_the_limit_is_exceeded(self, client):
        for _ in range(10):
            client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "wrong"})

        response = client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "wrong"})
        assert response.status_code == 429

    def test_limit_is_scoped_per_route_not_shared_with_signup(self, client):
        # Exhausting the login limiter must not block signups from the
        # same client -- the two routes are rate-limited independently.
        for _ in range(10):
            client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "wrong"})

        response = client.post(
            "/api/auth/signup",
            json={"name": "Still Works", "email": "still-works@example.com", "password": "correct-horse"},
        )
        assert response.status_code == 201


class TestSignupRateLimit:
    def test_blocks_once_the_limit_is_exceeded(self, client):
        for i in range(5):
            response = client.post(
                "/api/auth/signup",
                json={"name": "Spam", "email": f"spam-{i}@example.com", "password": "correct-horse"},
            )
            assert response.status_code == 201

        response = client.post(
            "/api/auth/signup",
            json={"name": "Spam", "email": "spam-6@example.com", "password": "correct-horse"},
        )
        assert response.status_code == 429


@pytest.fixture(autouse=True)
def _clean_limiter_between_tests():
    # Belt-and-suspenders on top of the global autouse fixture in
    # conftest.py -- this file specifically depends on exact counts.
    auth_rate_limiter.reset()
    yield
    auth_rate_limiter.reset()


class TestProductionJwtSecretValidation:
    def test_rejects_the_insecure_default_secret_in_production(self, monkeypatch):
        monkeypatch.setenv("ENVIRONMENT", "production")
        monkeypatch.setenv("JWT_SECRET", "changeme-in-env-file")
        get_settings.cache_clear()
        try:
            with pytest.raises(RuntimeError, match="insecure default"):
                get_settings()
        finally:
            get_settings.cache_clear()

    def test_allows_a_real_secret_in_production(self, monkeypatch):
        monkeypatch.setenv("ENVIRONMENT", "production")
        monkeypatch.setenv("JWT_SECRET", "a-long-random-production-secret")
        get_settings.cache_clear()
        try:
            settings = get_settings()
            assert settings.jwt_secret == "a-long-random-production-secret"
        finally:
            get_settings.cache_clear()

    def test_allows_the_default_secret_outside_production(self, monkeypatch):
        # Development/test environments must still work without forcing
        # every contributor to set a secret locally.
        monkeypatch.setenv("ENVIRONMENT", "development")
        monkeypatch.setenv("JWT_SECRET", "changeme-in-env-file")
        get_settings.cache_clear()
        try:
            settings = get_settings()
            assert settings.jwt_secret == "changeme-in-env-file"
        finally:
            get_settings.cache_clear()
