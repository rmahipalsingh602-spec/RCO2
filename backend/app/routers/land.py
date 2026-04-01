from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends

from ..dependencies import get_current_active_user
from ..schemas.land import Land as LandSchema, LandAddRequest
from ..models.user import User
from ..crud.lands import lands
from ..core.database import get_db

router = APIRouter()


@router.post("/add", response_model=LandSchema)
async def add_land(
    land_in: LandAddRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    land = await lands.create_with_carbon_credits(db=db, obj_in=land_in, user_id=current_user.id)
    return land


@router.get("/my", response_model=list[LandSchema])
async def get_my_land(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return await lands.get_by_user(db=db, user_id=current_user.id)
