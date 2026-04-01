from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from ..core.database import get_db
from ..dependencies import get_current_active_user
from ..models.credit import CarbonCredit, Transaction as TransactionModel
from ..models.land import Land
from ..models.user import User
from ..schemas.credit import CarbonCredit as CarbonCreditSchema
from ..schemas.credit import Transaction as TransactionSchema, TransactionCreate

router = APIRouter()

@router.get("/credits", response_model=List[CarbonCreditSchema])
async def list_available_credits(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CarbonCredit).where(CarbonCredit.status == "verified")
    )
    return result.scalars().all()

@router.post("/credits/buy", response_model=TransactionSchema)
async def buy_credit(
    tx_in: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    credit = await db.get(CarbonCredit, tx_in.carbon_credit_id)
    if not credit:
        raise HTTPException(status_code=404, detail="Carbon credit not found")
    if credit.status != "verified":
        raise HTTPException(status_code=400, detail="Carbon credit is not available for sale")

    seller_result = await db.execute(select(Land.user_id).where(Land.id == credit.land_id))
    seller_id = seller_result.scalar_one_or_none()
    if seller_id is None:
        raise HTTPException(status_code=400, detail="Carbon credit seller could not be resolved")

    transaction = TransactionModel(
        carbon_credit_id=credit.id,
        buyer_id=current_user.id,
        seller_id=seller_id,
        credits=tx_in.credits,
        amount=tx_in.amount,
        status="completed",
    )
    db.add(transaction)
    await db.flush()
    await db.refresh(transaction)
    return transaction

