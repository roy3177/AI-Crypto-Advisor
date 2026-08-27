# @author: Roy Meoded
# @date: 27.08.2026
# @description: Business logic for fetching and normalizing personalized coin prices and news.

"""
Market-data service: applies caching, calls provider clients, normalizes
their responses into the internal schemas, and falls back safely when a
provider is unavailable or unconfigured.

Callers pass already-validated, deduplicated coin ids (see
`app/core/constants.py` and the onboarding preference validators) --
this module never accepts arbitrary asset strings from a request.
"""
import json
import logging
from datetime import datetime, timezone
from pathlib import Path

from app.clients.coingecko import CoinGeckoClient
from app.clients.crypto_news import CryptoNewsClient
from app.clients.errors import ProviderError
from app.core.cache import TTLCache
from app.core.config import get_settings
from app.core.constants import ASSET_CATALOG
from app.schemas.market import CoinPrice, NewsArticle, NewsResponse, PricesResponse

logger = logging.getLogger(__name__)
settings = get_settings()

_ASSET_BY_ID = {item["id"]: item for item in ASSET_CATALOG}
_FALLBACK_NEWS_PATH = Path(__file__).resolve().parent.parent / "data" / "fallback_news.json"

# Process-local caches -- see app/core/cache.py for the documented limitation.
_price_cache: TTLCache[PricesResponse] = TTLCache()
_news_cache: TTLCache[NewsResponse] = TTLCache()


def _price_cache_key(coin_ids: list[str]) -> str:
    return "prices:" + ",".join(sorted(coin_ids))


def _news_cache_key(coin_ids: list[str]) -> str:
    return "news:" + ",".join(sorted(coin_ids)) if coin_ids else "news:general"


def _prices_content_key(coin_ids: list[str]) -> str:
    """Feedback target for the whole prices section (not per-coin) -- see
    Skills/manage-content-feedback/SKILLS.md's documented decision."""
    today = datetime.now(timezone.utc).date().isoformat()
    return f"prices:{','.join(sorted(coin_ids))}:{today}"


def _news_content_key(data_source: str, article_id: str) -> str:
    return f"news:{data_source}:{article_id}"


def _load_fallback_news() -> list[dict]:
    with _FALLBACK_NEWS_PATH.open(encoding="utf-8") as f:
        return json.load(f)


def _fallback_news_response() -> NewsResponse:
    items = [
        NewsArticle(
            id=item["id"],
            title=item["title"],
            summary=item.get("summary"),
            url=item.get("url"),
            published_at=item.get("published_at"),
            source_name=item.get("source_name"),
            related_assets=item.get("related_assets", []),
            data_source="static_fallback",
            is_fallback=True,
            content_key=_news_content_key("static_fallback", item["id"]),
        )
        for item in _load_fallback_news()
    ]
    return NewsResponse(items=items, status="fallback", generated_at=datetime.now(timezone.utc))


async def get_prices(coin_ids: list[str], client: CoinGeckoClient | None = None) -> PricesResponse:
    content_key = _prices_content_key(coin_ids)

    if not coin_ids:
        return PricesResponse(items=[], status="live", generated_at=datetime.now(timezone.utc), content_key=content_key)

    cache_key = _price_cache_key(coin_ids)
    cached = _price_cache.get(cache_key)
    if cached is not None:
        return cached.model_copy(update={"status": "cached"})

    owns_client = client is None
    active_client = client or CoinGeckoClient()
    try:
        raw = await active_client.get_simple_prices(coin_ids)
    except ProviderError as exc:
        logger.warning("coingecko_unavailable error=%s", exc)
        return PricesResponse(
            items=[], status="unavailable", generated_at=datetime.now(timezone.utc), content_key=content_key
        )
    finally:
        if owns_client:
            await active_client.aclose()

    items: list[CoinPrice] = []
    for coin_id in coin_ids:
        entry = raw.get(coin_id) if isinstance(raw.get(coin_id), dict) else None
        catalog_entry = _ASSET_BY_ID.get(coin_id, {"symbol": coin_id.upper(), "label": coin_id})

        last_updated = None
        raw_timestamp = entry.get("last_updated_at") if entry else None
        if isinstance(raw_timestamp, (int, float)):
            last_updated = datetime.fromtimestamp(raw_timestamp, tz=timezone.utc)

        items.append(
            CoinPrice(
                id=coin_id,
                symbol=catalog_entry["symbol"],
                name=catalog_entry["label"],
                price_usd=entry.get("usd") if entry else None,
                change_24h_percent=entry.get("usd_24h_change") if entry else None,
                last_updated=last_updated,
                source="coingecko",
                is_stale=False,
            )
        )

    result = PricesResponse(items=items, status="live", generated_at=datetime.now(timezone.utc), content_key=content_key)
    _price_cache.set(cache_key, result, settings.price_cache_ttl_seconds)
    return result


async def get_news(coin_ids: list[str], client: CryptoNewsClient | None = None) -> NewsResponse:
    cache_key = _news_cache_key(coin_ids)
    cached = _news_cache.get(cache_key)
    if cached is not None:
        return cached.model_copy(update={"status": "cached"})

    if not settings.cryptopanic_api_key:
        return _fallback_news_response()

    symbols = [_ASSET_BY_ID[coin_id]["symbol"] for coin_id in coin_ids if coin_id in _ASSET_BY_ID]

    owns_client = client is None
    active_client = client or CryptoNewsClient()
    try:
        raw_posts = await active_client.get_posts(currencies=symbols or None)
    except ProviderError as exc:
        logger.warning("cryptopanic_unavailable error=%s", exc)
        return _fallback_news_response()
    finally:
        if owns_client:
            await active_client.aclose()

    items: list[NewsArticle] = []
    seen_ids: set[str] = set()
    for post in raw_posts:
        post_id = str(post.get("id")) if post.get("id") is not None else None
        if not post_id or post_id in seen_ids:
            continue
        seen_ids.add(post_id)

        related = [
            currency["code"].lower()
            for currency in (post.get("currencies") or [])
            if isinstance(currency, dict) and currency.get("code")
        ]
        source = post.get("source") if isinstance(post.get("source"), dict) else {}

        items.append(
            NewsArticle(
                id=post_id,
                title=post.get("title") or "",
                summary=None,
                url=post.get("url"),
                published_at=post.get("published_at"),
                source_name=source.get("title"),
                related_assets=related,
                data_source="cryptopanic",
                is_fallback=False,
                content_key=_news_content_key("cryptopanic", post_id),
            )
        )

    if not items:
        return _fallback_news_response()

    result = NewsResponse(items=items, status="live", generated_at=datetime.now(timezone.utc))
    _news_cache.set(cache_key, result, settings.news_cache_ttl_seconds)
    return result
