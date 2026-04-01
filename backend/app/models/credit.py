import uuid
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Uuid
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from ..core.database import Base

class CarbonCredit(Base):
    __tablename__ = "carbon_credits"
    
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    land_id = Column(Uuid(as_uuid=True), ForeignKey("lands.id"))
    estimated_credits = Column(Float, nullable=False)
    verified_credits = Column(Float, default=0.0)
    status = Column(String, default="pending")  # pending, verified, rejected, sold
    year = Column(Integer, default=func.extract('year', func.now()))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    land = relationship("Land")

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    seller_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"))
    buyer_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"))
    carbon_credit_id = Column(Uuid(as_uuid=True), ForeignKey("carbon_credits.id"))
    credits = Column(Float, nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String, default="pending")  # pending, completed, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    seller = relationship("User", foreign_keys=[seller_id])
    buyer = relationship("User", foreign_keys=[buyer_id])
    carbon_credit = relationship("CarbonCredit")

