"""
Shared enum-like constants for onboarding and feedback.

The onboarding catalogs (`ASSET_CATALOG`, etc.) are the single source of
truth for both the plain "which ids are valid" lists used by validation
and CHECK constraints, and the display labels returned by
`GET /api/preferences/options`. Deriving the id lists from the catalogs
means a label can never drift out of sync with what's actually accepted.
"""

ASSET_CATALOG = [
    {"id": "bitcoin", "label": "Bitcoin", "symbol": "BTC"},
    {"id": "ethereum", "label": "Ethereum", "symbol": "ETH"},
    {"id": "solana", "label": "Solana", "symbol": "SOL"},
    {"id": "cardano", "label": "Cardano", "symbol": "ADA"},
    {"id": "dogecoin", "label": "Dogecoin", "symbol": "DOGE"},
]

INVESTOR_TYPE_CATALOG = [
    {"id": "hodler", "label": "HODLer"},
    {"id": "day_trader", "label": "Day Trader"},
    {"id": "nft_collector", "label": "NFT Collector"},
    {"id": "beginner", "label": "Beginner"},
]

CONTENT_TYPE_CATALOG = [
    {"id": "market_news", "label": "Market News"},
    {"id": "charts", "label": "Charts and Prices"},
    {"id": "social", "label": "Social Content"},
    {"id": "fun", "label": "Fun Content"},
]

SUPPORTED_ASSETS = [item["id"] for item in ASSET_CATALOG]
INVESTOR_TYPES = [item["id"] for item in INVESTOR_TYPE_CATALOG]
CONTENT_TYPES = [item["id"] for item in CONTENT_TYPE_CATALOG]

SECTION_TYPES = [
    "market_news",
    "coin_prices",
    "ai_insight",
    "crypto_meme",
]
