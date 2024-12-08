from pydantic import BaseModel, model_validator, Field
from typing import Optional
from app.validators.productos import ProductoValidator

class ProductoBase(BaseModel):
    nombre: str = Field(..., max_length=100)
    descripcion: Optional[str] = Field(None, max_length=500)
    precio: float
    cantidad: int
    categoria_id: int
    image_url: Optional[str] = None

    @model_validator(mode='before')
    @classmethod
    def validar_campos(cls, values):
        return ProductoValidator.validate_all(values)

class ProductoCreate(ProductoBase):
    pass

class Producto(ProductoBase):
    id: int

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True