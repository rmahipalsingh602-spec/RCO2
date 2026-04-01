from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import APIRouter, Depends

from ..core.database import get_db
from ..dependencies import get_current_active_user
from ..models.credit import CarbonCredit
from ..models.land import Land
from ..models.user import User
from ..schemas.credit import CarbonCredit as CarbonCreditSchema

router = APIRouter()


@router.get("/my", response_model=list[CarbonCreditSchema])
async def get_my_credits(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(
        select(CarbonCredit)
        .join(Land, CarbonCredit.land_id == Land.id)
        .where(Land.user_id == current_user.id)
        .order_by(CarbonCredit.created_at.desc())
    )
    return result.scalars().all()
