"""
Market route tests: authentication, ownership, and orchestration.
`market_service.get_prices` / `get_news` are monkeypatched here -- provider
correctness is already covered by the client and service tests.
"""
import uuid
from datetime import datetime, timezone

import pytest

from app.schemas.market import NewsResponse, PricesResponse
from app.services import market_service

VALID_PREFERENCES = {
    "interested_assets": ["bitcoin", "ethereum"],
    "investor_type": "hodler",
    "content_types": ["market_news"],
}


def signup_and_login(client) -> dict:
    email = f"user-{uuid.uuid4().hex[:12]}@example.com"
    response = client.post(
        "/api/auth/signup", json={"name": "Test User", "email": email, "password": "correct-horse"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def empty_prices_response() -> PricesResponse:
    return PricesResponse(items=[], status="live", generated_at=datetime.now(timezone.utc))


def empty_news_response() -> NewsResponse:
    return NewsResponse(items=[], status="fallback", generated_at=datetime.now(timezone.utc))


class TestAuthenticationRequirements:
    def test_unauthenticated_cannot_read_prices(self, client):
        response = client.get("/api/market/prices")
        assert response.status_code == 401

    def test_unauthenticated_cannot_read_news(self, client):
        response = client.get("/api/market/news")
        assert response.status_code == 401


class TestOnboardingPrecondition:
    def test_prices_return_404_before_onboarding(self, client):
        headers = signup_and_login(client)
        response = client.get("/api/market/prices", headers=headers)
        assert response.status_code == 404


class TestPersonalization:
    def test_prices_use_the_authenticated_users_own_assets(self, client, monkeypatch):
        headers = signup_and_login(client)
        client.put("/api/preferences/me", json=VALID_PREFERENCES, headers=headers)

        seen_coin_ids = []

        async def fake_get_prices(coin_ids, client=None):
            seen_coin_ids.append(coin_ids)
            return empty_prices_response()

        monkeypatch.setattr(market_service, "get_prices", fake_get_prices)

        response = client.get("/api/market/prices", headers=headers)
        assert response.status_code == 200
        assert seen_coin_ids == [["bitcoin", "ethereum"]]

    def test_two_users_each_get_their_own_assets(self, client, monkeypatch):
        headers_a = signup_and_login(client)
        headers_b = signup_and_login(client)
        client.put("/api/preferences/me", json=VALID_PREFERENCES, headers=headers_a)
        client.put(
            "/api/preferences/me",
            json={"interested_assets": ["dogecoin"], "investor_type": "beginner", "content_types": ["fun"]},
            headers=headers_b,
        )

        seen_coin_ids = []

        async def fake_get_prices(coin_ids, client=None):
            seen_coin_ids.append(coin_ids)
            return empty_prices_response()

        monkeypatch.setattr(market_service, "get_prices", fake_get_prices)

        client.get("/api/market/prices", headers=headers_a)
        client.get("/api/market/prices", headers=headers_b)

        assert seen_coin_ids == [["bitcoin", "ethereum"], ["dogecoin"]]

    def test_news_endpoint_returns_the_service_response(self, client, monkeypatch):
        headers = signup_and_login(client)
        client.put("/api/preferences/me", json=VALID_PREFERENCES, headers=headers)

        async def fake_get_news(coin_ids, client=None):
            return empty_news_response()

        monkeypatch.setattr(market_service, "get_news", fake_get_news)

        response = client.get("/api/market/news", headers=headers)
        assert response.status_code == 200
        assert response.json()["status"] == "fallback"
