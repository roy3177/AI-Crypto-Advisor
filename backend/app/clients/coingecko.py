# @author: Roy Meoded
# @date: 27.08.2026
# @description: HTTP client for fetching live coin prices from CoinGecko.

"""
CoinGecko client -- coin prices.

Verified against the current official docs (docs.coingecko.com/reference/
simple-price, checked 2026-08): the free "Demo" tier is reachable at
`https://api.coingecko.com/api/v3` and does NOT require an API key for
`/simple/price` (an optional demo key only raises the rate limit), so this
client must work with `coingecko_api_key` unset.

An `httpx.AsyncClient` can be injected (e.g. with a `MockTransport` in
tests) instead of letting this client build its own.
"""
import httpx

from app.clients.errors import (
    ProviderBadResponseError,
    ProviderRateLimitedError,
    ProviderTimeoutError,
    ProviderUnauthorizedError,
    ProviderUnavailableError,
)
from app.core.config import get_settings

settings = get_settings()

_TIMEOUT = httpx.Timeout(connect=3.0, read=5.0, write=5.0, pool=3.0)


class CoinGeckoClient:
    def __init__(self, http_client: httpx.AsyncClient | None = None) -> None:
        self._client = http_client or httpx.AsyncClient(base_url=settings.coingecko_api_base, timeout=_TIMEOUT)
        self._owns_client = http_client is None

    async def aclose(self) -> None:
        if self._owns_client:
            await self._client.aclose()

    async def get_simple_prices(self, coin_ids: list[str]) -> dict:
        """Returns the raw, still provider-shaped JSON from `/simple/price`,
        e.g. `{"bitcoin": {"usd": 112000, "usd_24h_change": 2.4, ...}}`."""
        params = {
            "ids": ",".join(coin_ids),
            "vs_currencies": "usd",
            "include_24hr_change": "true",
            "include_last_updated_at": "true",
        }
        headers = {"x-cg-demo-api-key": settings.coingecko_api_key} if settings.coingecko_api_key else {}

        try:
            response = await self._client.get("/simple/price", params=params, headers=headers)
        except httpx.TimeoutException as exc:
            raise ProviderTimeoutError("CoinGecko request timed out") from exc
        except httpx.RequestError as exc:
            raise ProviderUnavailableError("CoinGecko request failed") from exc

        if response.status_code == 401:
            raise ProviderUnauthorizedError("CoinGecko rejected the API key")
        if response.status_code == 429:
            raise ProviderRateLimitedError("CoinGecko rate limit exceeded")
        if response.status_code >= 500:
            raise ProviderUnavailableError(f"CoinGecko server error: {response.status_code}")
        if response.status_code >= 400:
            raise ProviderBadResponseError(f"CoinGecko rejected the request: {response.status_code}")

        try:
            data = response.json()
        except ValueError as exc:
            raise ProviderBadResponseError("CoinGecko returned invalid JSON") from exc

        if not isinstance(data, dict):
            raise ProviderBadResponseError("CoinGecko returned an unexpected response shape")

        return data
