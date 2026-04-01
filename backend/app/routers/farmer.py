from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from ..core.database import get_db
from ..dependencies import get_current_active_user, get_current_farmer
from ..models.credit import CarbonCredit as CarbonCreditModel
from ..models.land import Land as LandModel
from ..models.user import User
from ..schemas.credit import CarbonCredit as CarbonCreditSchema
from ..schemas.credit import CarbonCreditCreate
from ..schemas.land import Land as LandSchema, LandCreate
from ..crud.lands import lands
from ..crud.carbon_credit import carbon_credit
from app.services.carbon import calculate_credits

from fastapi import APIRouter

router = APIRouter()

@router.get("/calculate")
def calculate(acres: float):
    credits = calculate_credits(acres)
    return {
        "acres": acres,
        "credits": credits
    }


@router.post("/lands", response_model=LandSchema)
async def create_land(
    land_in: LandCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_farmer),
):
    land = LandModel(**land_in.model_dump(), user_id=current_user.id)
    db.add(land)
    await db.flush()
    await db.refresh(land)
    
    # Auto-generate credits
    estimated_credits = calculate_credits(land.area)
    credit = CarbonCreditCreate(land_id=str(land.id), estimated_credits=estimated_credits)
    await carbon_credit.create(db, obj_in=credit)
    
    return land

@router.get("/lands", response_model=List[LandSchema])
async def list_lands(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(LandModel).where(LandModel.user_id == current_user.id))
    return result.scalars().all()


@router.get("/credits", response_model=List[CarbonCreditSchema])
async def list_credits(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(
        select(CarbonCreditModel)
        .join(LandModel, CarbonCreditModel.land_id == LandModel.id)
        .where(LandModel.user_id == current_user.id)
    )
    return result.scalars().all()

