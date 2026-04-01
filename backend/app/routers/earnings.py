from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import APIRouter, Depends

from ..core.config import settings
from ..core.database import get_db
from ..dependencies import get_current_active_user
from ..models.credit import CarbonCredit
from ..models.land import Land
from ..models.user import User
from ..schemas.earnings import EarningsSummary
from ..services.market import calculate_market_value

router = APIRouter()


@router.get("/me", response_model=EarningsSummary)
async def get_my_earnings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(
        select(
            func.coalesce(func.sum(CarbonCredit.estimated_credits), 0.0),
            func.coalesce(func.sum(CarbonCredit.verified_credits), 0.0),
        )
        .join(Land, CarbonCredit.land_id == Land.id)
        .where(Land.user_id == current_user.id)
    )
    estimated_credits, verified_credits = result.one()

    return EarningsSummary(
        estimated_credits=float(estimated_credits or 0.0),
        verified_credits=float(verified_credits or 0.0),
        market_price=settings.MARKET_PRICE_INR,
        total_earnings=calculate_market_value(float(verified_credits or 0.0)),
        currency="INR",
    )
