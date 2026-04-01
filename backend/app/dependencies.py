from fastapi import HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from .core.security import get_current_user_id
from .crud.user import user
from .core.database import get_db
from .models.user import User

async def get_current_active_user(
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> User:
    user_obj = await user.get_by_id(db, user_id=current_user_id)
    if not user_obj:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user")
    return user_obj

def require_role(required_role: str):
    def role_checker(current_user: User = Depends(get_current_active_user)):
        if current_user.role != required_role:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

get_current_farmer = require_role("farmer")
get_current_company = require_role("company")
get_current_admin = require_role("admin")

