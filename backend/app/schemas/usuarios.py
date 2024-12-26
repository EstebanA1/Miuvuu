from typing import List, Optional
from pydantic import BaseModel, model_validator, Field
from app.validators.usuarios import UsuarioValidator

class UsuarioBase(BaseModel):
    nombre: str = Field(..., max_length=100)
    correo: str = Field(..., max_length=255)
    metodo_pago: List[str] = [] 
    rol: str = "usuario"   

    @model_validator(mode="before")
    @classmethod
    def validar_campos(cls, values):
        return UsuarioValidator.validate_all(values)

class UsuarioCreate(BaseModel):
    nombre: str
    correo: str
    contraseña: str
    metodo_pago: Optional[List[str]] = []
    rol: Optional[str] = "usuario"


class UsuarioSalida(BaseModel):
    id: int
    nombre: str
    correo: str
    metodo_pago: List[str]  
    rol: str 

    class Config:
        from_attributes = True

class Usuario(UsuarioSalida):
    pass