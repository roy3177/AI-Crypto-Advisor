"""
Insight route tests: authentication and orchestration.
`insight_service.get_or_create_daily_insight` is monkeypatched -- provider
and prompt correctness are already covered by the client and service tests.
"""
import uuid
from datetime import date, datetime, timezone

from app.schemas.insight import DISCLAIMER, FIXED_TITLE, DailyInsightResponse
from app.services import insight_service

VALID_PREFERENCES = {
    "interested_assets": ["bitcoin"],
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


def fake_insight_response() -> DailyInsightResponse:
    return DailyInsightResponse(
        id=uuid.uuid4(),
        date=date.today(),
        title=FIXED_TITLE,
        content="Stubbed insight content.",
        disclaimer=DISCLAIMER,
        source="ai",
        model_provider="openrouter",
        generated_at=datetime.now(timezone.utc),
    )


class TestAuthenticationRequirements:
    def test_unauthenticated_cannot_read_insight(self, client):
        response = client.get("/api/insights/daily")
        assert response.status_code == 401


class TestOnboardingPrecondition:
    def test_returns_404_before_onboarding(self, client):
        headers = signup_and_login(client)
        response = client.get("/api/insights/daily", headers=headers)
        assert response.status_code == 404


class TestOrchestration:
    def test_returns_the_service_response(self, client, monkeypatch):
        headers = signup_and_login(client)
        client.put("/api/preferences/me", json=VALID_PREFERENCES, headers=headers)

        async def fake_get_or_create(db, user, preference, client=None):
            return fake_insight_response()

        monkeypatch.setattr(insight_service, "get_or_create_daily_insight", fake_get_or_create)

        response = client.get("/api/insights/daily", headers=headers)
        assert response.status_code == 200
        body = response.json()
        assert body["content"] == "Stubbed insight content."
        assert body["disclaimer"] == DISCLAIMER

    def test_uses_the_authenticated_users_own_preferences(self, client, monkeypatch):
        headers = signup_and_login(client)
        client.put("/api/preferences/me", json=VALID_PREFERENCES, headers=headers)

        seen_investor_types = []

        async def fake_get_or_create(db, user, preference, client=None):
            seen_investor_types.append(preference.investor_type)
            return fake_insight_response()

        monkeypatch.setattr(insight_service, "get_or_create_daily_insight", fake_get_or_create)

        client.get("/api/insights/daily", headers=headers)
        assert seen_investor_types == ["hodler"]
