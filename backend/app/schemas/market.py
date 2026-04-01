from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, model_validator


class MarketplaceListing(BaseModel):
    id: UUID
    carbon_credit_id: UUID
    seller_id: UUID
    seller_name: str
    land_id: UUID
    land_name: str
    credits: float
    price: float
    market_price: float
    status: str
    created_at: datetime


class MarketBuyRequest(BaseModel):
    buyer_id: Optional[UUID] = None
    credit_id: Optional[UUID] = None
    carbon_credit_id: Optional[UUID] = None
    credits: Optional[float] = None
    amount: Optional[float] = None

    @model_validator(mode="after")
    def ensure_credit_reference(self):
        if not self.credit_id and not self.carbon_credit_id:
            raise ValueError("credit_id is required")
        return self

    @property
    def resolved_credit_id(self) -> UUID:
        return self.credit_id or self.carbon_credit_id  # type: ignore[return-value]
