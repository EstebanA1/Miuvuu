from sqlalchemy import Column, Integer, String, ARRAY
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from app.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), index=True)
    correo = Column(String(100), unique=True, index=True)
    contraseña = Column(String(100))
    metodo_pago = Column("metodo_pago", ARRAY(String(100)))
    rol = Column(String(50))
    favoritos = Column(ARRAY(Integer), default=[])
    carrito = Column(JSONB, default=[])
