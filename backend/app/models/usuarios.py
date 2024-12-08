from sqlalchemy import Column, Integer, String
from app.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), index=True)
    correo = Column(String(100), unique=True, index=True)
    contraseña = Column(String(100))
    metodo_pago = Column("metodopago", String(100))
