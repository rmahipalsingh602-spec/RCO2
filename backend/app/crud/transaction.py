from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ..crud.base import CRUDBase
from ..models.credit import Transaction
from ..schemas.credit import TransactionCreate, TransactionUpdate

class CRUDTransaction(CRUDBase[Transaction, TransactionCreate, TransactionUpdate]):
    pass

transaction = CRUDTransaction(Transaction)

