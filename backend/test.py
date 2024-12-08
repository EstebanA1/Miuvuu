from dotenv import load_dotenv
import os

# Cargar las variables de entorno
load_dotenv()

# Obtener la variable DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL")

# Imprimir el valor de DATABASE_URL
print(DATABASE_URL)
