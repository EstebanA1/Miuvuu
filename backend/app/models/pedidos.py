from sqlalchemy import Column, Integer, Numeric, String, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, index=True)
    detalles = Column(JSONB, nullable=True) 
    total = Column(Numeric(10, 2), nullable=False)
    estado = Column(String(50), nullable=False)  
    fecha = Column(TIMESTAMP, server_default=func.now())
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    
    usuario = relationship("Usuario", back_populates="pedidos")