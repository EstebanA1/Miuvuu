from typing import Any
from pydantic_core import PydanticCustomError

class ProductoValidator:
    @staticmethod
    def validate_nombre(nombre: str) -> None:
        if len(nombre) < 3:
            raise PydanticCustomError(
                "nombre_invalido",
                "El nombre debe tener al menos 3 caracteres"
            )
        if not nombre.replace(" ", "").isalnum():
            raise PydanticCustomError(
                "nombre_invalido",
                "El nombre solo puede contener caracteres alfanuméricos y espacios"
            )

    @staticmethod
    def validate_precio(precio: float) -> float:
        if precio <= 0:
            raise PydanticCustomError(
                "precio_invalido",
                "El precio debe ser mayor que 0"
            )
        return round(precio, 2)

    @staticmethod
    def validate_cantidad(cantidad: int) -> None:
        if cantidad < 0:
            raise PydanticCustomError(
                "cantidad_invalida",
                "La cantidad no puede ser negativa"
            )

    @staticmethod
    def validate_all(values: Any) -> Any:
        # Convertir a diccionario si es un objeto
        if hasattr(values, 'model_dump'):
            values_dict = values.model_dump()
        elif hasattr(values, 'dict'):
            values_dict = values.dict()
        elif hasattr(values, '__dict__'):
            values_dict = values.__dict__
        else:
            # Si es un diccionario u otro tipo iterable
            try:
                values_dict = dict(values)
            except (TypeError, ValueError):
                values_dict = {
                    k: getattr(values, k)
                    for k in ['nombre', 'precio', 'cantidad', 'descripcion', 'categoria_id']
                    if hasattr(values, k)
                }

        nombre = values_dict.get("nombre")
        precio = values_dict.get("precio")
        cantidad = values_dict.get("cantidad")

        if nombre:
            ProductoValidator.validate_nombre(nombre)
        
        if precio is not None:
            values_dict["precio"] = ProductoValidator.validate_precio(precio)
            
        if cantidad is not None:
            ProductoValidator.validate_cantidad(cantidad)

        return values_dict