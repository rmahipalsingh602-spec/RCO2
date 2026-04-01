from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import APIRouter, Depends, HTTPException, status

from ..core.config import settings
from ..core.database import get_db
from ..dependencies import get_current_active_user
from ..models.credit import CarbonCredit, Transaction
from ..models.land import Land
from ..models.user import User
from ..schemas.credit import Transaction as TransactionSchema
from ..schemas.market import MarketBuyRequest, MarketplaceListing
from ..services.market import calculate_market_value

router = APIRouter()


@router.get("/list", response_model=list[MarketplaceListing])
async def list_market_credits(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(
        select(CarbonCredit, Land, User)
        .join(Land, CarbonCredit.land_id == Land.id)
        .join(User, Land.user_id == User.id)
        .where(CarbonCredit.status == "verified", CarbonCredit.verified_credits > 0)
        .order_by(CarbonCredit.created_at.desc())
    )

    listings: list[MarketplaceListing] = []
    for credit, land, seller in result.all():
        listings.append(
            MarketplaceListing(
                id=credit.id,
                carbon_credit_id=credit.id,
                seller_id=seller.id,
                seller_name=seller.name or seller.email or "Verified seller",
                land_id=land.id,
                land_name=land.location_name or "Registered land",
                credits=float(credit.verified_credits or 0.0),
                price=calculate_market_value(float(credit.verified_credits or 0.0)),
                market_price=settings.MARKET_PRICE_INR,
                status=credit.status,
                created_at=credit.created_at,
            )
        )

    return listings


@router.post("/buy", response_model=TransactionSchema)
async def buy_market_credit(
    purchase: MarketBuyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if purchase.buyer_id and purchase.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only purchase credits for your own account.",
        )

    result = await db.execute(
        select(CarbonCredit, Land, User)
        .join(Land, CarbonCredit.land_id == Land.id)
        .join(User, Land.user_id == User.id)
        .where(CarbonCredit.id == purchase.resolved_credit_id)
    )
    record = result.first()

    if not record:
        raise HTTPException(status_code=404, detail="Carbon credit not found")

    credit, land, seller = record

    if seller.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot buy your own carbon credits.",
        )

    if credit.status != "verified" or float(credit.verified_credits or 0.0) <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Carbon credit is not available for purchase.",
        )

    available_credits = float(credit.verified_credits or 0.0)
    purchase_credits = float(purchase.credits or available_credits)

    if purchase_credits <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Purchase quantity must be greater than zero.",
        )

    if purchase_credits > available_credits:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Requested credits exceed the available verified balance.",
        )

    credit.verified_credits = round(available_credits - purchase_credits, 2)
    credit.status = "sold" if credit.verified_credits <= 0 else "verified"

    transaction = Transaction(
        seller_id=seller.id,
        buyer_id=current_user.id,
        carbon_credit_id=credit.id,
        credits=purchase_credits,
        amount=calculate_market_value(purchase_credits),
        status="completed",
    )
    db.add(transaction)
    await db.flush()
    await db.refresh(transaction)
    return transaction
