from pydantic import BaseModel
from datetime import datetime
from typing import Any, Optional

class PedidoBase(BaseModel):
    detalles: Optional[Any]
    total: float
    estado: str

class PedidoCreate(PedidoBase):
    pass

class PedidoOut(PedidoBase):
    id: int
    usuario_id: int
    fecha: datetime

    class Config:
        orm_mode = True
