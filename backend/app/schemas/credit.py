from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class CarbonCreditBase(BaseModel):
    estimated_credits: float
    year: Optional[int] = None
    status: str = "pending"

class CarbonCreditCreate(CarbonCreditBase):
    land_id: UUID


class CarbonCreditUpdate(BaseModel):
    estimated_credits: Optional[float] = None
    verified_credits: Optional[float] = None
    year: Optional[int] = None
    status: Optional[str] = None

class CarbonCredit(CarbonCreditBase):
    id: UUID
    land_id: UUID
    verified_credits: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class TransactionBase(BaseModel):
    credits: float
    amount: float

class TransactionCreate(TransactionBase):
    carbon_credit_id: UUID
    buyer_id: UUID


class TransactionUpdate(BaseModel):
    credits: Optional[float] = None
    amount: Optional[float] = None
    status: Optional[str] = None

class Transaction(TransactionBase):
    id: UUID
    seller_id: UUID
    buyer_id: UUID
    carbon_credit_id: UUID
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

