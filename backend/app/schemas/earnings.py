from pydantic import BaseModel


class EarningsSummary(BaseModel):
    estimated_credits: float
    verified_credits: float
    market_price: float
    total_earnings: float
    currency: str = "INR"
