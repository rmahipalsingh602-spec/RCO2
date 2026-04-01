from pydantic import BaseModel, ConfigDict, Field, computed_field, model_validator
from typing import Optional
from datetime import datetime
from uuid import UUID

class LandBase(BaseModel):
    location_name: str
    area: float
    farming_type: str  # "trees", "organic", "mixed"

class LandCreate(LandBase):
    pass


class LandAddRequest(BaseModel):
    location_name: str
    area_acres: float = Field(gt=0)
    farming_type: str

    @model_validator(mode="before")
    @classmethod
    def support_legacy_area(cls, value):
        if isinstance(value, dict) and "area_acres" not in value and "area" in value:
            normalized = dict(value)
            normalized["area_acres"] = normalized["area"]
            return normalized
        return value


class LandUpdate(BaseModel):
    location_name: Optional[str] = None
    area: Optional[float] = None
    farming_type: Optional[str] = None
    verified: Optional[bool] = None

class Land(LandBase):
    id: UUID
    user_id: UUID
    verified: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def area_acres(self) -> float:
        return self.area

