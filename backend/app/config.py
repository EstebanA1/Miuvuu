import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")  
APP_TITLE = os.getenv("APP_TITLE", "Miuvuu API")
APP_VERSION = os.getenv("APP_VERSION", "0.1.0") 
DEBUG = os.getenv("DEBUG", "true").lower() in ["true", "1", "yes"]

SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key") 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

API_URL = os.getenv("API_URL", "http://localhost:8000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
NGROK_TOKEN = os.getenv("NGROK_TOKEN")
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")
MERCADOPAGO_ACCESS_TOKEN = os.getenv("MERCADOPAGO_ACCESS_TOKEN")
MERCADOPAGO_NOTIFICATION_URL = os.getenv("MERCADOPAGO_NOTIFICATION_URL")