import uuid
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, String, Uuid
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..core.database import Base

class Land(Base):
    __tablename__ = "lands"
    
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"))
    location_name = Column(String)
    area = Column(Float, nullable=False)  # stored in acres
    farming_type = Column(String, nullable=False)  # trees, organic, mixed
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")

