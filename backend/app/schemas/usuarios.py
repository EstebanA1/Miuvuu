from pydantic import BaseModel, model_validator, Field
from app.validators.usuarios import UsuarioValidator


class UsuarioBase(BaseModel):
    nombre: str = Field(..., max_length=100)
    correo: str = Field(..., max_length=255)
    metodo_pago: str = Field(..., max_length=20)

    @model_validator(mode="before")
    @classmethod
    def validar_campos(cls, values):
        return UsuarioValidator.validate_all(values)


class UsuarioCreate(UsuarioBase):
    contraseña: str = Field(..., max_length=72)


class UsuarioSalida(BaseModel):
    id: int
    nombre: str
    correo: str
    metodo_pago: str

    class Config:
        from_attributes = True


class Usuario(UsuarioSalida):
    pass
