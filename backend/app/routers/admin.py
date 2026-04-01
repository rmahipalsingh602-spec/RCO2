from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from typing import Dict

from ..core.database import get_db
from ..dependencies import get_current_admin
from ..models.credit import CarbonCredit
from ..models.land import Land
from ..models.user import User
from ..schemas.credit import CarbonCredit as CarbonCreditSchema

router = APIRouter()

@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
) -> Dict[str, float]:
    total_users = (
        await db.execute(select(func.count()).select_from(User))
    ).scalar_one()
    total_credits = (
        await db.execute(
            select(func.coalesce(func.sum(CarbonCredit.verified_credits), 0.0))
        )
    ).scalar_one()
    total_revenue = 0.1 * total_credits  # Mock 10% platform fee
    
    return {
        "total_users": total_users,
        "total_credits_generated": total_credits,
        "platform_revenue": total_revenue
    }


@router.post("/verify/{credit_id}", response_model=CarbonCreditSchema)
async def verify_credit(
    credit_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    credit = await db.get(CarbonCredit, credit_id)
    if not credit:
        raise HTTPException(status_code=404, detail="Carbon credit not found")

    credit.status = "verified"
    credit.verified_credits = credit.estimated_credits

    land = await db.get(Land, credit.land_id)
    if land:
        land.verified = True

    await db.flush()
    await db.refresh(credit)
    return credit

