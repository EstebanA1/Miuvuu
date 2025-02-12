from typing import List, Optional, Dict
from pydantic import BaseModel, model_validator, Field
from app.validators.usuarios import UsuarioValidator
from typing import Any

class UsuarioBase(BaseModel):
    nombre: str = Field(..., max_length=100)
    correo: str = Field(..., max_length=255)
    metodo_pago: List[str] = [] 
    rol: str = "usuario"   
    favoritos: List[int] = []  
    carrito: List[Dict[str, int]] = Field(
        default=[],
    )

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
    favoritos: Optional[List[int]] = []  
    carrito: Optional[List[Dict[str, int]]] = []

class UsuarioSalida(BaseModel):
    id: int
    nombre: str
    correo: str
    metodo_pago: List[str] = Field(default_factory=list)
    rol: str 
    favoritos: List[int] = Field(default_factory=list)
    carrito: List[Dict[str, Any]] = Field(default_factory=list)

    class Config:
        from_attributes = True

class Usuario(UsuarioSalida):
    pass

class UsuarioUpdateProfile(BaseModel):
    nombre: Optional[str] = Field(None, max_length=100)
    correo: Optional[str] = Field(None, max_length=255)
    metodo_pago: Optional[List[str]] = None
    rol: Optional[str] = None
    favoritos: Optional[List[int]] = None
    carrito: Optional[List[Dict[str, int]]] = None

    current_password: Optional[str] = None
    nueva_contraseña: Optional[str] = None
    confirmar_nueva_contraseña: Optional[str] = None