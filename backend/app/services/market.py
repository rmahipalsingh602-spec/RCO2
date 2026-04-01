from ..core.config import settings


def calculate_market_value(credits: float) -> float:
    return round(float(credits) * settings.MARKET_PRICE_INR, 2)
