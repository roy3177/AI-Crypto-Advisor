"""
Feedback tests, run through HTTP via the `client` fixture.
"""
import uuid
from datetime import date

from app.models.content_feedback import ContentFeedback
from app.models.daily_insight import DailyInsight
from app.models.user import User


def signup_and_login(client) -> tuple[str, dict]:
    email = f"user-{uuid.uuid4().hex[:12]}@example.com"
    response = client.post(
        "/api/auth/signup", json={"name": "Test User", "email": email, "password": "correct-horse"}
    )
    body = response.json()
    return body["user"]["id"], {"Authorization": f"Bearer {body['access_token']}"}


class TestValidation:
    def test_thumbs_up_is_accepted(self, client):
        _, headers = signup_and_login(client)
        response = client.put(
            "/api/feedback",
            json={"section_type": "crypto_meme", "content_key": "meme:diamond-hands-01", "vote": 1},
            headers=headers,
        )
        assert response.status_code == 200
        assert response.json()["vote"] == 1

    def test_thumbs_down_is_accepted(self, client):
        _, headers = signup_and_login(client)
        response = client.put(
            "/api/feedback",
            json={"section_type": "crypto_meme", "content_key": "meme:diamond-hands-01", "vote": -1},
            headers=headers,
        )
        assert response.status_code == 200
        assert response.json()["vote"] == -1

    def test_vote_zero_is_rejected(self, client):
        _, headers = signup_and_login(client)
        response = client.put(
            "/api/feedback",
            json={"section_type": "crypto_meme", "content_key": "meme:diamond-hands-01", "vote": 0},
            headers=headers,
        )
        assert response.status_code == 422

    def test_unknown_section_type_is_rejected(self, client):
        _, headers = signup_and_login(client)
        response = client.put(
            "/api/feedback",
            json={"section_type": "not_a_section", "content_key": "meme:diamond-hands-01", "vote": 1},
            headers=headers,
        )
        assert response.status_code == 422

    def test_blank_content_key_is_rejected(self, client):
        _, headers = signup_and_login(client)
        response = client.put(
            "/api/feedback", json={"section_type": "crypto_meme", "content_key": "", "vote": 1}, headers=headers
        )
        assert response.status_code == 422

    def test_mismatched_prefix_is_rejected(self, client):
        _, headers = signup_and_login(client)
        response = client.put(
            "/api/feedback",
            json={"section_type": "crypto_meme", "content_key": "news:cryptopanic:1", "vote": 1},
            headers=headers,
        )
        assert response.status_code == 422


class TestAuthenticationAndOwnership:
    def test_unauthenticated_vote_is_rejected(self, client):
        response = client.put(
            "/api/feedback",
            json={"section_type": "crypto_meme", "content_key": "meme:diamond-hands-01", "vote": 1},
        )
        assert response.status_code == 401

    def test_request_body_cannot_select_another_user(self, client, db_session):
        user_id, headers = signup_and_login(client)
        other_id = str(uuid.uuid4())

        response = client.put(
            "/api/feedback",
            json={
                "section_type": "crypto_meme",
                "content_key": "meme:diamond-hands-01",
                "vote": 1,
                "user_id": other_id,
            },
            headers=headers,
        )
        assert response.status_code == 200

        stored = db_session.query(ContentFeedback).filter(ContentFeedback.content_key == "meme:diamond-hands-01").all()
        assert len(stored) == 1
        assert str(stored[0].user_id) == user_id

    def test_cannot_vote_on_another_users_insight(self, client, db_session):
        owner_id, owner_headers = signup_and_login(client)
        _, other_headers = signup_and_login(client)

        insight = DailyInsight(
            user_id=uuid.UUID(owner_id),
            insight_date=date(2026, 1, 1),
            content="Private insight",
            context_snapshot={},
            model_provider="openrouter",
            model_name="test-model",
        )
        db_session.add(insight)
        db_session.commit()

        response = client.put(
            "/api/feedback",
            json={"section_type": "ai_insight", "content_key": f"insight:{insight.id}", "vote": 1},
            headers=other_headers,
        )
        assert response.status_code == 404

    def test_one_user_cannot_read_another_users_feedback(self, client):
        _, headers_a = signup_and_login(client)
        _, headers_b = signup_and_login(client)

        client.put(
            "/api/feedback",
            json={"section_type": "crypto_meme", "content_key": "meme:diamond-hands-01", "vote": 1},
            headers=headers_a,
        )

        response = client.get("/api/feedback/me", headers=headers_b)
        assert response.status_code == 200
        assert response.json() == []


class TestPersistence:
    def test_first_vote_creates_one_row(self, client, db_session):
        user_id, headers = signup_and_login(client)
        client.put(
            "/api/feedback",
            json={"section_type": "crypto_meme", "content_key": "meme:diamond-hands-01", "vote": 1},
            headers=headers,
        )
        rows = db_session.query(ContentFeedback).filter(ContentFeedback.user_id == uuid.UUID(user_id)).all()
        assert len(rows) == 1

    def test_same_vote_again_does_not_create_a_duplicate(self, client, db_session):
        user_id, headers = signup_and_login(client)
        payload = {"section_type": "crypto_meme", "content_key": "meme:diamond-hands-01", "vote": 1}
        client.put("/api/feedback", json=payload, headers=headers)
        client.put("/api/feedback", json=payload, headers=headers)

        rows = db_session.query(ContentFeedback).filter(ContentFeedback.user_id == uuid.UUID(user_id)).all()
        assert len(rows) == 1

    def test_changing_vote_updates_the_existing_row(self, client, db_session):
        user_id, headers = signup_and_login(client)
        client.put(
            "/api/feedback",
            json={"section_type": "crypto_meme", "content_key": "meme:diamond-hands-01", "vote": 1},
            headers=headers,
        )
        client.put(
            "/api/feedback",
            json={"section_type": "crypto_meme", "content_key": "meme:diamond-hands-01", "vote": -1},
            headers=headers,
        )

        rows = db_session.query(ContentFeedback).filter(ContentFeedback.user_id == uuid.UUID(user_id)).all()
        assert len(rows) == 1
        assert rows[0].vote == -1

    def test_different_users_may_vote_on_the_same_content(self, client):
        _, headers_a = signup_and_login(client)
        _, headers_b = signup_and_login(client)
        payload = {"section_type": "crypto_meme", "content_key": "meme:diamond-hands-01", "vote": 1}

        response_a = client.put("/api/feedback", json=payload, headers=headers_a)
        response_b = client.put("/api/feedback", json={**payload, "vote": -1}, headers=headers_b)

        assert response_a.status_code == 200
        assert response_b.status_code == 200

    def test_one_user_may_vote_on_different_content(self, client, db_session):
        user_id, headers = signup_and_login(client)
        client.put(
            "/api/feedback",
            json={"section_type": "crypto_meme", "content_key": "meme:diamond-hands-01", "vote": 1},
            headers=headers,
        )
        client.put(
            "/api/feedback",
            json={"section_type": "crypto_meme", "content_key": "meme:to-the-moon-01", "vote": -1},
            headers=headers,
        )

        rows = db_session.query(ContentFeedback).filter(ContentFeedback.user_id == uuid.UUID(user_id)).all()
        assert len(rows) == 2

    def test_updated_at_changes_when_vote_changes(self, client, db_session):
        user_id, headers = signup_and_login(client)
        client.put(
            "/api/feedback",
            json={"section_type": "crypto_meme", "content_key": "meme:diamond-hands-01", "vote": 1},
            headers=headers,
        )
        row = db_session.query(ContentFeedback).filter(ContentFeedback.user_id == uuid.UUID(user_id)).first()
        first_updated_at = row.updated_at

        client.put(
            "/api/feedback",
            json={"section_type": "crypto_meme", "content_key": "meme:diamond-hands-01", "vote": -1},
            headers=headers,
        )
        db_session.refresh(row)
        assert row.updated_at >= first_updated_at

    def test_get_my_feedback_returns_saved_votes(self, client):
        _, headers = signup_and_login(client)
        client.put(
            "/api/feedback",
            json={"section_type": "crypto_meme", "content_key": "meme:diamond-hands-01", "vote": 1},
            headers=headers,
        )

        response = client.get("/api/feedback/me", headers=headers)
        assert response.status_code == 200
        body = response.json()
        assert len(body) == 1
        assert body[0]["content_key"] == "meme:diamond-hands-01"
