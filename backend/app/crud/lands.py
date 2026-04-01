from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..crud.base import CRUDBase
from ..models.land import Land
from ..models.credit import CarbonCredit
from ..schemas.land import LandCreate, LandUpdate
from ..schemas.credit import CarbonCreditCreate
from .carbon_credit import carbon_credit

class CRUDLand(CRUDBase[Land, LandCreate, LandUpdate]):
    
    async def get_by_user(self, db: AsyncSession, user_id: str) -> List[Land]:
        result = await db.execute(select(Land).where(Land.user_id == user_id))
        return result.scalars().all()

    async def create_with_carbon_credits(self, db: AsyncSession, *, obj_in: LandCreate, user_id: str) -> Land:
        # Create the land record
        db_obj = self.model(**obj_in.dict(), user_id=user_id)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)

        # Calculate carbon credits
        credits = 0
        if db_obj.farming_type == "trees":
            credits = db_obj.area * 5
        elif db_obj.farming_type == "organic":
            credits = db_obj.area * 2
        elif db_obj.farming_type == "mixed":
            credits = db_obj.area * 3
        
        # Create the carbon credit record
        credit_obj = CarbonCreditCreate(land_id=db_obj.id, estimated_credits=credits)
        await carbon_credit.create(db, obj_in=credit_obj)

        return db_obj
    
lands = CRUDLand(Land)

