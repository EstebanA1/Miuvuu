import os
from dotenv import load_dotenv

# Cargar las variables de entorno desde el archivo .env
load_dotenv()

# Configuraciones generales
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")  # URL de la base de datos
APP_TITLE = os.getenv("APP_TITLE", "Miuvuu API")  # Título de la app
APP_VERSION = os.getenv("APP_VERSION", "0.1.0")  # Versión de la app

# Configuraciones para desarrollo o producción
DEBUG = os.getenv("DEBUG", "true").lower() in ["true", "1", "yes"]

# Claves secretas (para JWT, si las usas en el futuro)
SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")  # Cambiar en producción
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
