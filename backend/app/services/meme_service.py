"""
Meme selection: a small curated local catalog (no scraping, no hotlinking
unreliable image hosts -- see /build-crypto-dashboard SKILL.md), picked
randomly once per dashboard load. The frontend only calls this once on
mount, so re-renders never change the meme on their own.
"""
import json
import random
from pathlib import Path

from app.schemas.meme import MemeResponse

_MEMES_PATH = Path(__file__).resolve().parent.parent / "data" / "crypto_memes.json"


def _load_memes() -> list[dict]:
    with _MEMES_PATH.open(encoding="utf-8") as f:
        return json.load(f)


def get_random_meme() -> MemeResponse:
    memes = _load_memes()
    chosen = random.choice(memes)
    return MemeResponse(**chosen)
