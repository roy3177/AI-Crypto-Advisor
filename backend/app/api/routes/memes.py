"""
Meme route. Public (no auth) -- the catalog is the same static, non-
personal content for every viewer, just like /api/preferences/options.
"""
from fastapi import APIRouter

from app.schemas.meme import MemeResponse
from app.services import meme_service

router = APIRouter(tags=["memes"])


@router.get("/random", response_model=MemeResponse)
def read_random_meme() -> MemeResponse:
    return meme_service.get_random_meme()
