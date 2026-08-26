"""
Market-service tests: caching, normalization, and fallback behavior.
Provider clients are simple fakes -- no network, no live API key needed.
"""
import pytest

from app.clients.errors import ProviderTimeoutError
from app.core.config import get_settings
from app.services import market_service


class FakeCoinGeckoClient:
    def __init__(self, response: dict | None = None, error: Exception | None = None):
        self.response = response
        self.error = error
        self.calls = 0

    async def get_simple_prices(self, coin_ids: list[str]) -> dict:
        self.calls += 1
        if self.error:
            raise self.error
        return self.response


class FakeNewsClient:
    def __init__(self, response: list[dict] | None = None, error: Exception | None = None):
        self.response = response
        self.error = error
        self.calls = 0

    async def get_posts(self, currencies: list[str] | None = None) -> list[dict]:
        self.calls += 1
        if self.error:
            raise self.error
        return self.response


@pytest.fixture(autouse=True)
def clear_caches():
    market_service._price_cache._store.clear()
    market_service._news_cache._store.clear()
    yield
    market_service._price_cache._store.clear()
    market_service._news_cache._store.clear()


class TestGetPrices:
    @pytest.mark.asyncio
    async def test_valid_response_is_normalized(self):
        client = FakeCoinGeckoClient(
            response={"bitcoin": {"usd": 100000, "usd_24h_change": 2.5, "last_updated_at": 1700000000}}
        )
        result = await market_service.get_prices(["bitcoin"], client=client)
        assert result.status == "live"
        assert result.items[0].price_usd == 100000
        assert result.items[0].change_24h_percent == 2.5
        assert result.items[0].symbol == "BTC"

    @pytest.mark.asyncio
    async def test_missing_requested_asset_is_handled_not_invented(self):
        client = FakeCoinGeckoClient(response={})
        result = await market_service.get_prices(["bitcoin"], client=client)
        assert result.items[0].price_usd is None
        assert result.items[0].change_24h_percent is None

    @pytest.mark.asyncio
    async def test_zero_price_and_negative_change_are_preserved(self):
        client = FakeCoinGeckoClient(response={"bitcoin": {"usd": 0, "usd_24h_change": -5.2}})
        result = await market_service.get_prices(["bitcoin"], client=client)
        assert result.items[0].price_usd == 0
        assert result.items[0].change_24h_percent == -5.2

    @pytest.mark.asyncio
    async def test_provider_error_results_in_unavailable_status(self):
        client = FakeCoinGeckoClient(error=ProviderTimeoutError("timeout"))
        result = await market_service.get_prices(["bitcoin"], client=client)
        assert result.status == "unavailable"
        assert result.items == []

    @pytest.mark.asyncio
    async def test_fresh_cache_prevents_a_second_provider_call(self):
        client = FakeCoinGeckoClient(response={"bitcoin": {"usd": 100000}})
        first = await market_service.get_prices(["bitcoin"], client=client)
        second = await market_service.get_prices(["bitcoin"], client=client)
        assert client.calls == 1
        assert first.status == "live"
        assert second.status == "cached"


class TestGetNews:
    @pytest.mark.asyncio
    async def test_valid_response_is_normalized(self, monkeypatch):
        monkeypatch.setattr(get_settings(), "cryptopanic_api_key", "test-key")
        posts = [
            {
                "id": 1,
                "title": "Bitcoin rallies",
                "url": "https://example.com/a",
                "published_at": "2026-08-25T12:00:00Z",
                "source": {"title": "Example"},
                "currencies": [{"code": "BTC"}],
            }
        ]
        result = await market_service.get_news(["bitcoin"], client=FakeNewsClient(response=posts))
        assert result.status == "live"
        assert result.items[0].title == "Bitcoin rallies"
        assert result.items[0].related_assets == ["btc"]
        assert result.items[0].is_fallback is False

    @pytest.mark.asyncio
    async def test_duplicate_articles_are_removed(self, monkeypatch):
        monkeypatch.setattr(get_settings(), "cryptopanic_api_key", "test-key")
        posts = [{"id": 1, "title": "A"}, {"id": 1, "title": "A duplicate"}]
        result = await market_service.get_news([], client=FakeNewsClient(response=posts))
        assert len(result.items) == 1

    @pytest.mark.asyncio
    async def test_missing_api_key_uses_fallback_without_calling_provider(self, monkeypatch):
        monkeypatch.setattr(get_settings(), "cryptopanic_api_key", None)
        client = FakeNewsClient(response=[])
        result = await market_service.get_news(["bitcoin"], client=client)
        assert result.status == "fallback"
        assert client.calls == 0
        assert all(item.is_fallback for item in result.items)

    @pytest.mark.asyncio
    async def test_provider_timeout_falls_back(self, monkeypatch):
        monkeypatch.setattr(get_settings(), "cryptopanic_api_key", "test-key")
        client = FakeNewsClient(error=ProviderTimeoutError("timeout"))
        result = await market_service.get_news(["bitcoin"], client=client)
        assert result.status == "fallback"

    @pytest.mark.asyncio
    async def test_fallback_content_is_labeled_not_live(self, monkeypatch):
        monkeypatch.setattr(get_settings(), "cryptopanic_api_key", None)
        result = await market_service.get_news([], client=FakeNewsClient(response=[]))
        assert result.status == "fallback"
        assert all(item.data_source == "static_fallback" for item in result.items)
