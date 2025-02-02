from pydantic_core import PydanticCustomError
from typing import Any, List, Dict
import re


class UsuarioValidator:
    @staticmethod
    def validate_nombre(nombre: str) -> None:
        if len(nombre) < 2:
            raise PydanticCustomError(
                "nombre_invalido", "El nombre debe tener al menos 2 caracteres"
            )
        if len(nombre) > 100:
            raise PydanticCustomError(
                "nombre_invalido", "El nombre no puede exceder los 100 caracteres"
            )
        if not all(part.isalpha() or part.isspace() for part in nombre):
            raise PydanticCustomError(
                "nombre_invalido", "El nombre solo puede contener letras y espacios"
            )

    @staticmethod
    def validate_correo(correo: str) -> None:
        patron_correo = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(patron_correo, correo):
            raise PydanticCustomError(
                "correo_invalido", "El formato del correo electrónico no es válido"
            )
        if len(correo) > 255:
            raise PydanticCustomError(
                "correo_invalido",
                "El correo electrónico no puede exceder los 255 caracteres",
            )

    @staticmethod
    def validate_contraseña(contraseña: str) -> None:
        if len(contraseña) < 8:
            raise PydanticCustomError(
                "contraseña_invalida", "La contraseña debe tener al menos 8 caracteres"
            )
        # if len(contraseña) > 72:  # Límite común para hash bcrypt
        #     raise PydanticCustomError(
        #         "contraseña_invalida",
        #         "La contraseña no puede exceder los 72 caracteres",
        #     )
        # if not re.search(r"[A-Z]", contraseña):
        #     raise PydanticCustomError(
        #         "contraseña_invalida",
        #         "La contraseña debe contener al menos una letra mayúscula",
        #     )
        # if not re.search(r"[a-z]", contraseña):
        #     raise PydanticCustomError(
        #         "contraseña_invalida",
        #         "La contraseña debe contener al menos una letra minúscula",
        #     )
        # if not re.search(r"\d", contraseña):
        #     raise PydanticCustomError(
        #         "contraseña_invalida", "La contraseña debe contener al menos un número"
        #     )
        # if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", contraseña):
        #     raise PydanticCustomError(
        #         "contraseña_invalida",
        #         "La contraseña debe contener al menos un carácter especial",
        #     )

    @staticmethod
    def validate_metodo_pago(metodos_pago: List[str]) -> None:
        metodos_validos = ["Tarjeta de crédito", "Tarjeta de débito", "Paypal"]
        
        if not metodos_pago:
            raise PydanticCustomError(
                "metodo_pago_invalido",
                "Debe especificar al menos un método de pago"
            )
            
        for metodo in metodos_pago:
            if metodo not in metodos_validos:
                raise PydanticCustomError(
                    "metodo_pago_invalido",
                    f"El método de pago debe ser uno de los siguientes: {', '.join(metodos_validos)}"
                )

    @staticmethod
    def validate_rol(rol: str) -> None:
        roles_validos = ["admin", "usuario", "vendedor"]
        if rol not in roles_validos:
            raise PydanticCustomError(
                "rol_invalido",
                f"El rol debe ser uno de los siguientes: {', '.join(roles_validos)}"
            )

    @staticmethod
    def validate_carrito(carrito: List[Dict[str, int]]):
        for item in carrito:
            if not all(key in item for key in ['producto_id', 'cantidad']):
                raise PydanticCustomError(
                    "carrito_invalido",
                    "Cada elemento del carrito debe tener 'producto_id' y 'cantidad'"
                )
            if item["cantidad"] < 1:
                raise PydanticCustomError(
                    "cantidad_invalida",
                    "La cantidad debe ser al menos 1"
                )

    @staticmethod
    def validate_all(values: Any, contexto: str = "entrada") -> Any:
        """
        Valida los datos proporcionados según las reglas establecidas.
        Si el contexto es 'salida', no se aplican validaciones estrictas.
        """
        if contexto == "salida":
            return values

        if hasattr(values, "model_dump"):
            values_dict = values.model_dump()
        elif hasattr(values, "dict"):
            values_dict = values.dict()
        elif hasattr(values, "__dict__"):
            values_dict = values.__dict__
        else:
            try:
                values_dict = dict(values)
            except (TypeError, ValueError):
                values_dict = {
                    k: getattr(values, k)
                    for k in ["nombre", "correo", "contraseña", "metodo_pago", "rol"]
                    if hasattr(values, k)
                }

        if "nombre" in values_dict:
            UsuarioValidator.validate_nombre(values_dict["nombre"])
        if "correo" in values_dict:
            UsuarioValidator.validate_correo(values_dict["correo"])
        if "contraseña" in values_dict:
            UsuarioValidator.validate_contraseña(values_dict["contraseña"])
        if "metodo_pago" in values_dict:
            UsuarioValidator.validate_metodo_pago(values_dict["metodo_pago"])
        if "rol" in values_dict:
            UsuarioValidator.validate_rol(values_dict["rol"])

        return values_dict