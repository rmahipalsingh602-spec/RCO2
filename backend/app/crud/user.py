import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List

from ..crud.base import CRUDBase
from ..models.user import User
from ..schemas.user import UserCreate, UserUpdate

class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    async def get_by_id(self, db: AsyncSession, *, user_id: str | uuid.UUID) -> Optional[User]:
        normalized_id: str | uuid.UUID = user_id

        if isinstance(user_id, str):
            try:
                normalized_id = uuid.UUID(user_id)
            except ValueError:
                normalized_id = user_id

        result = await db.execute(select(self.model).where(self.model.id == normalized_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, db: AsyncSession, *, email: str) -> Optional[User]:
        result = await db.execute(select(self.model).where(self.model.email == email))
        return result.scalar_one_or_none()

    async def get_by_google_id(self, db: AsyncSession, *, google_id: str) -> Optional[User]:
        result = await db.execute(select(self.model).where(self.model.google_id == google_id))
        return result.scalar_one_or_none()

    async def get_by_role(self, db: AsyncSession, *, role: str) -> List[User]:
        result = await db.execute(select(self.model).where(self.model.role == role))
        return result.scalars().all()

user = CRUDUser(User)

