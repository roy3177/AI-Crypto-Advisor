"""
Shared enum-like constants for onboarding and feedback.

These lists are the single source of truth for "what values are allowed"
across the app: Pydantic schemas validate against them, and the database
models turn them into CHECK constraints so invalid data cannot be inserted
even by a bug that bypasses the API layer.
"""

SUPPORTED_ASSETS = [
    "bitcoin",
    "ethereum",
    "solana",
    "cardano",
    "dogecoin",
]

INVESTOR_TYPES = [
    "hodler",
    "day_trader",
    "nft_collector",
    "beginner",
]

CONTENT_TYPES = [
    "market_news",
    "charts",
    "social",
    "fun",
]

SECTION_TYPES = [
    "market_news",
    "coin_prices",
    "ai_insight",
    "crypto_meme",
]
