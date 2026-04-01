# backend/app/services/carbon.py

def calculate_credits(acres: float):
    """
    Simple carbon calculation
    1 acre = 1.2 tCO2e (demo)
    """
    return acres * 1.2

