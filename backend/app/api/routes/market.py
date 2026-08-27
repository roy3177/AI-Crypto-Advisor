# @author: Roy Meoded
# @date: 27.08.2026
# @description: Endpoints for personalized coin prices and market news.

"""
Market-data routes: personalized coin prices and news for the
authenticated user, based on their saved `interested_assets`. Provider
details stay entirely inside app/services/market_service.py.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.market import NewsResponse, PricesResponse
from app.services import market_service, preferences_service

router = APIRouter(tags=["market"])


def _get_interested_assets(db: Session, user: User) -> list[str]:
    preference = preferences_service.get_preferences(db, user)
    if preference is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Preferences have not been set yet")
    return preference.interested_assets


@router.get("/prices", response_model=PricesResponse)
async def read_prices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PricesResponse:
    coin_ids = _get_interested_assets(db, current_user)
    return await market_service.get_prices(coin_ids)


@router.get("/news", response_model=NewsResponse)
async def read_news(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> NewsResponse:
    coin_ids = _get_interested_assets(db, current_user)
    return await market_service.get_news(coin_ids)
