"""
Data-integrity tests against a real PostgreSQL database.

These exercise the constraints defined in app/models/*.py -- the same
constraints that were just verified to exist in the generated Alembic
migration. Application-level (service/API) behavior such as "upsert a
vote" is tested separately once those services exist; here we only prove
the database itself enforces the rules even if application code has a bug.
"""
import uuid
from datetime import date, timedelta

import pytest
from sqlalchemy.exc import IntegrityError

from app.models import ContentFeedback, DailyInsight, User, UserPreference


def make_user(session, email="user@example.com") -> User:
    user = User(name="Test User", email=email, password_hash="not-a-real-hash")
    session.add(user)
    session.flush()
    return user


class TestUser:
    def test_valid_user_can_be_created(self, db_session):
        user = make_user(db_session)
        assert user.id is not None
        assert user.onboarding_completed is False
        assert user.is_active is True
        assert user.created_at is not None

    def test_duplicate_email_is_rejected(self, db_session):
        make_user(db_session, email="dupe@example.com")
        db_session.add(User(name="Other", email="dupe@example.com", password_hash="x"))
        with pytest.raises(IntegrityError):
            db_session.flush()

    def test_updated_at_changes_on_update(self, db_session):
        user = make_user(db_session)
        db_session.flush()
        first_updated_at = user.updated_at
        user.name = "Renamed"
        db_session.flush()
        db_session.refresh(user)
        assert user.updated_at >= first_updated_at


class TestUserPreference:
    def test_one_preference_row_per_user(self, db_session):
        user = make_user(db_session)
        db_session.add(
            UserPreference(
                user_id=user.id,
                interested_assets=["bitcoin"],
                investor_type="hodler",
                content_types=["market_news"],
            )
        )
        db_session.flush()

        db_session.add(
            UserPreference(
                user_id=user.id,
                interested_assets=["ethereum"],
                investor_type="beginner",
                content_types=["fun"],
            )
        )
        with pytest.raises(IntegrityError):
            db_session.flush()

    def test_supported_investor_type_is_stored(self, db_session):
        user = make_user(db_session)
        pref = UserPreference(
            user_id=user.id,
            interested_assets=["bitcoin", "solana"],
            investor_type="day_trader",
            content_types=["charts", "social"],
        )
        db_session.add(pref)
        db_session.flush()
        assert pref.investor_type == "day_trader"
        assert pref.interested_assets == ["bitcoin", "solana"]

    def test_unsupported_investor_type_is_rejected_by_database(self, db_session):
        user = make_user(db_session)
        db_session.add(
            UserPreference(
                user_id=user.id,
                interested_assets=["bitcoin"],
                investor_type="not_a_real_type",
                content_types=["fun"],
            )
        )
        with pytest.raises(IntegrityError):
            db_session.flush()


class TestDailyInsight:
    def test_one_insight_per_user_and_date(self, db_session):
        user = make_user(db_session)
        today = date.today()
        db_session.add(
            DailyInsight(
                user_id=user.id,
                insight_date=today,
                content="Insight one",
                context_snapshot={},
                model_provider="openrouter",
                model_name="test-model",
            )
        )
        db_session.flush()

        db_session.add(
            DailyInsight(
                user_id=user.id,
                insight_date=today,
                content="Insight two",
                context_snapshot={},
                model_provider="openrouter",
                model_name="test-model",
            )
        )
        with pytest.raises(IntegrityError):
            db_session.flush()

    def test_same_user_can_have_insights_on_different_dates(self, db_session):
        user = make_user(db_session)
        today = date.today()
        db_session.add(
            DailyInsight(
                user_id=user.id,
                insight_date=today,
                content="Today",
                context_snapshot={},
                model_provider="openrouter",
                model_name="test-model",
            )
        )
        db_session.add(
            DailyInsight(
                user_id=user.id,
                insight_date=today - timedelta(days=1),
                content="Yesterday",
                context_snapshot={},
                model_provider="openrouter",
                model_name="test-model",
            )
        )
        db_session.flush()  # should not raise

    def test_different_users_can_have_insights_on_same_date(self, db_session):
        user_a = make_user(db_session, email="a@example.com")
        user_b = make_user(db_session, email="b@example.com")
        today = date.today()
        db_session.add_all(
            [
                DailyInsight(
                    user_id=user_a.id,
                    insight_date=today,
                    content="For A",
                    context_snapshot={},
                    model_provider="openrouter",
                    model_name="test-model",
                ),
                DailyInsight(
                    user_id=user_b.id,
                    insight_date=today,
                    content="For B",
                    context_snapshot={},
                    model_provider="openrouter",
                    model_name="test-model",
                ),
            ]
        )
        db_session.flush()  # should not raise


class TestContentFeedback:
    def test_vote_must_be_plus_or_minus_one(self, db_session):
        user = make_user(db_session)
        db_session.add(
            ContentFeedback(user_id=user.id, section_type="market_news", content_key="news:1", vote=5)
        )
        with pytest.raises(IntegrityError):
            db_session.flush()

    def test_duplicate_vote_on_same_content_is_rejected(self, db_session):
        user = make_user(db_session)
        db_session.add(
            ContentFeedback(user_id=user.id, section_type="coin_prices", content_key="prices:bitcoin:2026-08-25", vote=1)
        )
        db_session.flush()

        db_session.add(
            ContentFeedback(user_id=user.id, section_type="coin_prices", content_key="prices:bitcoin:2026-08-25", vote=-1)
        )
        with pytest.raises(IntegrityError):
            db_session.flush()

    def test_user_can_change_an_existing_vote(self, db_session):
        user = make_user(db_session)
        feedback = ContentFeedback(user_id=user.id, section_type="ai_insight", content_key="insight:abc", vote=1)
        db_session.add(feedback)
        db_session.flush()

        feedback.vote = -1
        db_session.flush()
        db_session.refresh(feedback)
        assert feedback.vote == -1

    def test_different_users_can_vote_on_same_content(self, db_session):
        user_a = make_user(db_session, email="a@example.com")
        user_b = make_user(db_session, email="b@example.com")
        db_session.add_all(
            [
                ContentFeedback(user_id=user_a.id, section_type="crypto_meme", content_key="meme:1", vote=1),
                ContentFeedback(user_id=user_b.id, section_type="crypto_meme", content_key="meme:1", vote=-1),
            ]
        )
        db_session.flush()  # should not raise

    def test_one_user_can_vote_on_different_content(self, db_session):
        user = make_user(db_session)
        db_session.add_all(
            [
                ContentFeedback(user_id=user.id, section_type="crypto_meme", content_key="meme:1", vote=1),
                ContentFeedback(user_id=user.id, section_type="crypto_meme", content_key="meme:2", vote=-1),
            ]
        )
        db_session.flush()  # should not raise

    def test_feedback_requires_an_existing_user(self, db_session):
        db_session.add(
            ContentFeedback(user_id=uuid.uuid4(), section_type="market_news", content_key="news:1", vote=1)
        )
        with pytest.raises(IntegrityError):
            db_session.flush()


class TestCascadingDelete:
    def test_deleting_user_deletes_preference_insights_and_feedback(self, db_session):
        user = make_user(db_session)
        db_session.add(
            UserPreference(
                user_id=user.id, interested_assets=["bitcoin"], investor_type="hodler", content_types=["fun"]
            )
        )
        db_session.add(
            DailyInsight(
                user_id=user.id,
                insight_date=date.today(),
                content="x",
                context_snapshot={},
                model_provider="openrouter",
                model_name="test-model",
            )
        )
        db_session.add(ContentFeedback(user_id=user.id, section_type="crypto_meme", content_key="meme:1", vote=1))
        db_session.flush()

        db_session.delete(user)
        db_session.flush()

        assert db_session.query(UserPreference).filter_by(user_id=user.id).count() == 0
        assert db_session.query(DailyInsight).filter_by(user_id=user.id).count() == 0
        assert db_session.query(ContentFeedback).filter_by(user_id=user.id).count() == 0
