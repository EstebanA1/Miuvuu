from pydantic import BaseModel, Field
from typing import Optional, List
from pydantic import validator

class ProductoBase(BaseModel):
    nombre: str = Field(..., max_length=100)
    descripcion: Optional[str] = Field(None, max_length=500)
    precio: float
    cantidad: int
    categoria_id: int
    image_url: Optional[List[str]] = None

    @validator('image_url', pre=True)
    def ensure_list(cls, value):
        if value is None:
            return value
        if isinstance(value, str):
            return [value]
        return value

    class Config:
        from_attributes = True

class ProductoCreate(ProductoBase):
    pass

class Producto(ProductoBase):
    id: int

    class Config:
        from_attributes = True

class ProductoResponse(BaseModel):
    products: List[Producto]
    total: int

    class Config:
        from_attributes = True