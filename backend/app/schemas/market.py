"""
Normalized internal response schemas for market data. These are the shapes
the frontend actually receives -- provider-specific fields never leak
past `app/clients/*`.
"""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, field_validator

PriceStatus = Literal["live", "cached", "unavailable"]
NewsStatus = Literal["live", "cached", "fallback", "unavailable"]


def _require_https(value: str | None) -> str | None:
    """External URLs are untrusted input -- only pass through safe schemes."""
    if value is None:
        return None
    if not value.lower().startswith("https://"):
        return None
    return value


class CoinPrice(BaseModel):
    id: str
    symbol: str
    name: str
    price_usd: float | None
    change_24h_percent: float | None
    last_updated: datetime | None
    source: str
    is_stale: bool = False


class PricesResponse(BaseModel):
    items: list[CoinPrice]
    status: PriceStatus
    generated_at: datetime
    # Feedback target for the whole section (not per-coin) -- see
    # Skills/manage-content-feedback/SKILLS.md's documented decision.
    content_key: str


class NewsArticle(BaseModel):
    id: str
    title: str
    summary: str | None = None
    url: str | None = None
    published_at: datetime | None = None
    source_name: str | None = None
    related_assets: list[str] = []
    data_source: str
    is_fallback: bool = False
    # Feedback target for this specific article.
    content_key: str

    @field_validator("url")
    @classmethod
    def validate_url(cls, value: str | None) -> str | None:
        return _require_https(value)


class NewsResponse(BaseModel):
    items: list[NewsArticle]
    status: NewsStatus
    generated_at: datetime
