from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "farmer"
    is_verified: bool = False

class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_verified: Optional[bool] = None

class User(UserBase):
    id: UUID
    google_id: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

