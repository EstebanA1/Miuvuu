import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")  
APP_TITLE = os.getenv("APP_TITLE", "Miuvuu API")
APP_VERSION = os.getenv("APP_VERSION", "0.1.0") 

DEBUG = os.getenv("DEBUG", "true").lower() in ["true", "1", "yes"]

# Claves secretas (para JWT, si se usa en el futuro)
SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")  # Cambiar en producción
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
