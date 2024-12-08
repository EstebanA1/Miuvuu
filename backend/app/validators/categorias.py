from pydantic_core import PydanticCustomError
from typing import Any

class CategoriaValidator:
    @staticmethod
    def validate_nombre(nombre: str) -> None:
        if len(nombre) < 2:
            raise PydanticCustomError(
                "nombre_invalido",
                "El nombre de la categoría debe tener al menos 2 caracteres"
            )
        if len(nombre) > 50:
            raise PydanticCustomError(
                "nombre_invalido",
                "El nombre de la categoría no puede exceder los 50 caracteres"
            )
        if not nombre.replace(" ", "").replace("-", "").isalnum():
            raise PydanticCustomError(
                "nombre_invalido",
                "El nombre solo puede contener letras, números, espacios y guiones"
            )

    @staticmethod
    def validate_descripcion(descripcion: str | None) -> None:
        if descripcion is not None:
            if len(descripcion) < 10:
                raise PydanticCustomError(
                    "descripcion_invalida",
                    "La descripción debe tener al menos 10 caracteres"
                )
            if len(descripcion) > 200:
                raise PydanticCustomError(
                    "descripcion_invalida",
                    "La descripción no puede exceder los 200 caracteres"
                )

    @staticmethod
    def validate_all(values: Any) -> Any:
        if hasattr(values, 'model_dump'):
            values_dict = values.model_dump()
        elif hasattr(values, 'dict'):
            values_dict = values.dict()
        elif hasattr(values, '__dict__'):
            values_dict = values.__dict__
        else:
            try:
                values_dict = dict(values)
            except (TypeError, ValueError):
                values_dict = {
                    k: getattr(values, k)
                    for k in ['nombre', 'descripcion']
                    if hasattr(values, k)
                }

        nombre = values_dict.get("nombre")
        descripcion = values_dict.get("descripcion")

        if nombre:
            CategoriaValidator.validate_nombre(nombre)
        
        if descripcion is not None:
            CategoriaValidator.validate_descripcion(descripcion)

        return values_dict

