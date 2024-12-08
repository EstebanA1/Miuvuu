from pydantic import BaseModel, model_validator, Field
from typing import Optional
from app.validators.categorias import CategoriaValidator

class CategoriaBase(BaseModel):
    nombre: str = Field(..., max_length=50)
    descripcion: Optional[str] = Field(None, max_length=200)
    genero: str = Field(..., max_length=50)

    @model_validator(mode='before')
    @classmethod
    def validar_campos(cls, values):
        return CategoriaValidator.validate_all(values)

class CategoriaCreate(CategoriaBase):
    pass

class Categoria(CategoriaBase):
    id: int

    class Config:
        from_attributes = True
