"""
Pydantic-level validation tests. These don't touch the database at all --
they prove invalid input is rejected with a clear error before it could
ever reach a database constraint.
"""
import pytest
from pydantic import ValidationError

from app.schemas.feedback import FeedbackCreate
from app.schemas.preference import UserPreferenceCreate


class TestUserPreferenceSchema:
    def test_valid_preferences_are_accepted(self):
        pref = UserPreferenceCreate(
            interested_assets=["bitcoin", "ethereum"],
            investor_type="hodler",
            content_types=["market_news", "fun"],
        )
        assert pref.investor_type == "hodler"

    def test_empty_assets_are_rejected(self):
        with pytest.raises(ValidationError):
            UserPreferenceCreate(interested_assets=[], investor_type="hodler", content_types=["fun"])

    def test_unsupported_asset_is_rejected(self):
        with pytest.raises(ValidationError):
            UserPreferenceCreate(interested_assets=["dogecoin", "not_a_coin"], investor_type="hodler", content_types=["fun"])

    def test_unsupported_investor_type_is_rejected(self):
        with pytest.raises(ValidationError):
            UserPreferenceCreate(interested_assets=["bitcoin"], investor_type="whale", content_types=["fun"])

    def test_unsupported_content_type_is_rejected(self):
        with pytest.raises(ValidationError):
            UserPreferenceCreate(interested_assets=["bitcoin"], investor_type="hodler", content_types=["memes_galore"])


class TestFeedbackSchema:
    def test_valid_vote_is_accepted(self):
        feedback = FeedbackCreate(section_type="market_news", content_key="news:1", vote=1)
        assert feedback.vote == 1

    def test_vote_outside_plus_minus_one_is_rejected(self):
        with pytest.raises(ValidationError):
            FeedbackCreate(section_type="market_news", content_key="news:1", vote=5)

    def test_unsupported_section_type_is_rejected(self):
        with pytest.raises(ValidationError):
            FeedbackCreate(section_type="not_a_section", content_key="news:1", vote=1)
