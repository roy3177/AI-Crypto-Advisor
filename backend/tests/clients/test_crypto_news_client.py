"""
CryptoPanic client tests, mocked at the transport level (no live API key
or network access required).
"""
import httpx
import pytest

from app.clients.crypto_news import CryptoNewsClient
from app.clients.errors import (
    ProviderBadResponseError,
    ProviderRateLimitedError,
    ProviderTimeoutError,
    ProviderUnauthorizedError,
    ProviderUnavailableError,
)
from app.core.config import get_settings


def make_client(handler) -> CryptoNewsClient:
    transport = httpx.MockTransport(handler)
    http_client = httpx.AsyncClient(transport=transport, base_url="https://cryptopanic.com/api/free/v2")
    return CryptoNewsClient(http_client=http_client)


@pytest.mark.asyncio
async def test_missing_api_key_raises_unauthorized_without_a_network_call(monkeypatch):
    monkeypatch.setattr(get_settings(), "cryptopanic_api_key", None)
    called = False

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal called
        called = True
        return httpx.Response(200, json={"results": []})

    client = make_client(handler)
    with pytest.raises(ProviderUnauthorizedError):
        await client.get_posts()
    assert called is False


@pytest.mark.asyncio
async def test_successful_response_returns_results_list(monkeypatch):
    monkeypatch.setattr(get_settings(), "cryptopanic_api_key", "test-key")

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.params["auth_token"] == "test-key"
        return httpx.Response(200, json={"results": [{"id": 1, "title": "Example"}]})

    client = make_client(handler)
    results = await client.get_posts(currencies=["BTC"])
    assert results == [{"id": 1, "title": "Example"}]


@pytest.mark.asyncio
async def test_timeout_raises_provider_timeout_error(monkeypatch):
    monkeypatch.setattr(get_settings(), "cryptopanic_api_key", "test-key")

    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ReadTimeout("timed out", request=request)

    client = make_client(handler)
    with pytest.raises(ProviderTimeoutError):
        await client.get_posts()


@pytest.mark.asyncio
async def test_401_raises_provider_unauthorized_error(monkeypatch):
    monkeypatch.setattr(get_settings(), "cryptopanic_api_key", "test-key")

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(401, json={"detail": "invalid token"})

    client = make_client(handler)
    with pytest.raises(ProviderUnauthorizedError):
        await client.get_posts()


@pytest.mark.asyncio
async def test_429_raises_provider_rate_limited_error(monkeypatch):
    monkeypatch.setattr(get_settings(), "cryptopanic_api_key", "test-key")

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(429, json={})

    client = make_client(handler)
    with pytest.raises(ProviderRateLimitedError):
        await client.get_posts()


@pytest.mark.asyncio
async def test_unexpected_shape_raises_provider_bad_response_error(monkeypatch):
    monkeypatch.setattr(get_settings(), "cryptopanic_api_key", "test-key")

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"unexpected": "shape"})

    client = make_client(handler)
    with pytest.raises(ProviderBadResponseError):
        await client.get_posts()


@pytest.mark.asyncio
async def test_server_error_raises_provider_unavailable_error(monkeypatch):
    monkeypatch.setattr(get_settings(), "cryptopanic_api_key", "test-key")

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(503, text="down for maintenance")

    client = make_client(handler)
    with pytest.raises(ProviderUnavailableError):
        await client.get_posts()
