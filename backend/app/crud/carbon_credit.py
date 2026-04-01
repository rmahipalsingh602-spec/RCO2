from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from ..crud.base import CRUDBase
from ..models.credit import CarbonCredit
from ..schemas.credit import CarbonCreditCreate, CarbonCreditUpdate

class CRUDCarbonCredit(CRUDBase[CarbonCredit, CarbonCreditCreate, CarbonCreditUpdate]):
    async def get_by_land(self, db: AsyncSession, land_id: str) -> List[CarbonCredit]:
        result = await db.execute(select(self.model).where(self.model.land_id == land_id))
        return result.scalars().all()

    async def get_available(self, db: AsyncSession) -> List[CarbonCredit]:
        result = await db.execute(
            select(self.model).where(self.model.status == "verified")
        )
        return result.scalars().all()

carbon_credit = CRUDCarbonCredit(CarbonCredit)

