"""
CoinGecko client tests. These never touch the real API -- an
`httpx.MockTransport` stands in for the network so behavior is
deterministic and doesn't depend on CoinGecko being reachable.
"""
import httpx
import pytest

from app.clients.coingecko import CoinGeckoClient
from app.clients.errors import (
    ProviderBadResponseError,
    ProviderRateLimitedError,
    ProviderTimeoutError,
    ProviderUnauthorizedError,
    ProviderUnavailableError,
)


def make_client(handler) -> CoinGeckoClient:
    transport = httpx.MockTransport(handler)
    http_client = httpx.AsyncClient(transport=transport, base_url="https://api.coingecko.com/api/v3")
    return CoinGeckoClient(http_client=http_client)


@pytest.mark.asyncio
async def test_successful_response_is_returned():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200, json={"bitcoin": {"usd": 100000, "usd_24h_change": 1.5, "last_updated_at": 1700000000}}
        )

    client = make_client(handler)
    data = await client.get_simple_prices(["bitcoin"])
    assert data["bitcoin"]["usd"] == 100000


@pytest.mark.asyncio
async def test_no_api_key_is_required():
    seen_headers = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen_headers.update(request.headers)
        return httpx.Response(200, json={"bitcoin": {"usd": 100000}})

    client = make_client(handler)
    await client.get_simple_prices(["bitcoin"])
    assert "x-cg-demo-api-key" not in seen_headers


@pytest.mark.asyncio
async def test_timeout_raises_provider_timeout_error():
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ReadTimeout("timed out", request=request)

    client = make_client(handler)
    with pytest.raises(ProviderTimeoutError):
        await client.get_simple_prices(["bitcoin"])


@pytest.mark.asyncio
async def test_connection_error_raises_provider_unavailable_error():
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("connection failed", request=request)

    client = make_client(handler)
    with pytest.raises(ProviderUnavailableError):
        await client.get_simple_prices(["bitcoin"])


@pytest.mark.asyncio
async def test_401_raises_provider_unauthorized_error():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(401, json={"error": "bad key"})

    client = make_client(handler)
    with pytest.raises(ProviderUnauthorizedError):
        await client.get_simple_prices(["bitcoin"])


@pytest.mark.asyncio
async def test_429_raises_provider_rate_limited_error():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(429, json={})

    client = make_client(handler)
    with pytest.raises(ProviderRateLimitedError):
        await client.get_simple_prices(["bitcoin"])


@pytest.mark.asyncio
async def test_500_raises_provider_unavailable_error():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(500, text="internal error")

    client = make_client(handler)
    with pytest.raises(ProviderUnavailableError):
        await client.get_simple_prices(["bitcoin"])


@pytest.mark.asyncio
async def test_invalid_json_raises_provider_bad_response_error():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, text="not json")

    client = make_client(handler)
    with pytest.raises(ProviderBadResponseError):
        await client.get_simple_prices(["bitcoin"])
