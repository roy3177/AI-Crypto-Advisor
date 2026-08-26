"""
Preferences / onboarding tests, run through HTTP via the `client` fixture.
"""
import uuid

from app.models.user import User
from app.models.user_preference import UserPreference


def signup_and_login(client) -> tuple[str, dict]:
    """Create a user and return (user_id, auth_headers)."""
    email = f"user-{uuid.uuid4().hex[:12]}@example.com"
    response = client.post(
        "/api/auth/signup", json={"name": "Test User", "email": email, "password": "correct-horse"}
    )
    body = response.json()
    return body["user"]["id"], {"Authorization": f"Bearer {body['access_token']}"}


VALID_PAYLOAD = {
    "interested_assets": ["bitcoin", "ethereum"],
    "investor_type": "hodler",
    "content_types": ["market_news", "fun"],
}


class TestOptionsEndpoint:
    def test_options_are_public_and_return_full_catalog(self, client):
        response = client.get("/api/preferences/options")
        assert response.status_code == 200
        body = response.json()
        assert {item["id"] for item in body["assets"]} == {"bitcoin", "ethereum", "solana", "cardano", "dogecoin"}
        assert {item["id"] for item in body["investor_types"]} == {
            "hodler",
            "day_trader",
            "nft_collector",
            "beginner",
        }
        assert {item["id"] for item in body["content_types"]} == {"market_news", "charts", "social", "fun"}


class TestAuthenticationRequirements:
    def test_unauthenticated_cannot_read_preferences(self, client):
        response = client.get("/api/preferences/me")
        assert response.status_code == 401

    def test_unauthenticated_cannot_save_preferences(self, client):
        response = client.put("/api/preferences/me", json=VALID_PAYLOAD)
        assert response.status_code == 401

    def test_submitted_user_id_is_ignored(self, client, db_session):
        user_id, headers = signup_and_login(client)
        other_id = str(uuid.uuid4())

        response = client.put("/api/preferences/me", json={**VALID_PAYLOAD, "user_id": other_id}, headers=headers)
        assert response.status_code == 200

        stored = db_session.query(UserPreference).filter(UserPreference.user_id == uuid.UUID(user_id)).first()
        assert stored is not None
        assert db_session.query(UserPreference).filter(UserPreference.user_id == uuid.UUID(other_id)).first() is None


class TestValidation:
    def test_valid_selections_are_accepted(self, client):
        _, headers = signup_and_login(client)
        response = client.put("/api/preferences/me", json=VALID_PAYLOAD, headers=headers)
        assert response.status_code == 200
        assert response.json()["onboarding_completed"] is True

    def test_empty_asset_list_is_rejected(self, client):
        _, headers = signup_and_login(client)
        response = client.put("/api/preferences/me", json={**VALID_PAYLOAD, "interested_assets": []}, headers=headers)
        assert response.status_code == 422

    def test_unsupported_asset_is_rejected(self, client):
        _, headers = signup_and_login(client)
        response = client.put(
            "/api/preferences/me", json={**VALID_PAYLOAD, "interested_assets": ["not_a_coin"]}, headers=headers
        )
        assert response.status_code == 422

    def test_duplicate_assets_are_deduplicated_not_rejected(self, client):
        _, headers = signup_and_login(client)
        response = client.put(
            "/api/preferences/me",
            json={**VALID_PAYLOAD, "interested_assets": ["bitcoin", "bitcoin", "ethereum"]},
            headers=headers,
        )
        assert response.status_code == 200
        assert response.json()["interested_assets"] == ["bitcoin", "ethereum"]

    def test_missing_investor_type_is_rejected(self, client):
        _, headers = signup_and_login(client)
        payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "investor_type"}
        response = client.put("/api/preferences/me", json=payload, headers=headers)
        assert response.status_code == 422

    def test_unsupported_investor_type_is_rejected(self, client):
        _, headers = signup_and_login(client)
        response = client.put("/api/preferences/me", json={**VALID_PAYLOAD, "investor_type": "whale"}, headers=headers)
        assert response.status_code == 422

    def test_empty_content_types_is_rejected(self, client):
        _, headers = signup_and_login(client)
        response = client.put("/api/preferences/me", json={**VALID_PAYLOAD, "content_types": []}, headers=headers)
        assert response.status_code == 422

    def test_unsupported_content_type_is_rejected(self, client):
        _, headers = signup_and_login(client)
        response = client.put(
            "/api/preferences/me", json={**VALID_PAYLOAD, "content_types": ["not_a_category"]}, headers=headers
        )
        assert response.status_code == 422


class TestPersistence:
    def test_first_submission_creates_preferences_and_completes_onboarding(self, client, db_session):
        user_id, headers = signup_and_login(client)

        before = db_session.query(User).filter(User.id == uuid.UUID(user_id)).first()
        assert before.onboarding_completed is False

        response = client.put("/api/preferences/me", json=VALID_PAYLOAD, headers=headers)
        assert response.status_code == 200

        db_session.refresh(before)
        assert before.onboarding_completed is True
        assert db_session.query(UserPreference).filter(UserPreference.user_id == before.id).count() == 1

    def test_invalid_submission_does_not_complete_onboarding(self, client, db_session):
        user_id, headers = signup_and_login(client)
        response = client.put("/api/preferences/me", json={**VALID_PAYLOAD, "investor_type": "whale"}, headers=headers)
        assert response.status_code == 422

        user = db_session.query(User).filter(User.id == uuid.UUID(user_id)).first()
        assert user.onboarding_completed is False

    def test_second_submission_updates_existing_row_without_duplicating(self, client, db_session):
        user_id, headers = signup_and_login(client)
        client.put("/api/preferences/me", json=VALID_PAYLOAD, headers=headers)

        updated_payload = {
            "interested_assets": ["solana"],
            "investor_type": "day_trader",
            "content_types": ["charts"],
        }
        response = client.put("/api/preferences/me", json=updated_payload, headers=headers)
        assert response.status_code == 200
        assert response.json()["interested_assets"] == ["solana"]

        rows = db_session.query(UserPreference).filter(UserPreference.user_id == uuid.UUID(user_id)).all()
        assert len(rows) == 1
        assert rows[0].investor_type == "day_trader"

    def test_one_users_update_does_not_affect_another(self, client, db_session):
        user_a_id, headers_a = signup_and_login(client)
        user_b_id, headers_b = signup_and_login(client)

        client.put("/api/preferences/me", json=VALID_PAYLOAD, headers=headers_a)
        client.put(
            "/api/preferences/me",
            json={"interested_assets": ["dogecoin"], "investor_type": "beginner", "content_types": ["social"]},
            headers=headers_b,
        )

        pref_a = db_session.query(UserPreference).filter(UserPreference.user_id == uuid.UUID(user_a_id)).first()
        pref_b = db_session.query(UserPreference).filter(UserPreference.user_id == uuid.UUID(user_b_id)).first()
        assert pref_a.interested_assets == ["bitcoin", "ethereum"]
        assert pref_b.interested_assets == ["dogecoin"]

    def test_get_me_returns_404_before_onboarding(self, client):
        _, headers = signup_and_login(client)
        response = client.get("/api/preferences/me", headers=headers)
        assert response.status_code == 404

    def test_get_me_returns_saved_preferences(self, client):
        _, headers = signup_and_login(client)
        client.put("/api/preferences/me", json=VALID_PAYLOAD, headers=headers)

        response = client.get("/api/preferences/me", headers=headers)
        assert response.status_code == 200
        assert response.json()["investor_type"] == "hodler"
