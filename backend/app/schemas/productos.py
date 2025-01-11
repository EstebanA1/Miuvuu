from pydantic import BaseModel, Field
from typing import Optional, List

class ProductoBase(BaseModel):
    nombre: str = Field(..., max_length=100)
    descripcion: Optional[str] = Field(None, max_length=500)
    precio: float
    cantidad: int
    categoria_id: int
    image_url: Optional[str] = None

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