import os
import asyncio
import shutil
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select 

from app.models.productos import Producto

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise Exception("No se encontró DATABASE_URL en las variables de entorno.")

engine = create_async_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

BASE_UPLOAD_DIR = Path("uploads")
PRODUCTS_UPLOAD_DIR = BASE_UPLOAD_DIR / "CarpetasDeProductos"
PRODUCTS_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def get_folder_name_from_filename(filename: str) -> str:
    """
    Extrae el nombre de la carpeta a partir del nombre del archivo.
    Se toma el segmento anterior al primer guion bajo ('_').
    Por ejemplo: 'vestidoDamazco_20241229234345_5.webp' -> 'vestidoDamazco'
    """
    base = Path(filename).stem  # 'vestidoDamazco_20241229234345_5'
    if "_" in base:
        return base.split("_")[0]
    return base

async def migrate_product_image(product: Producto, session: AsyncSession):
    """
    Si el campo image_url del producto es un string (es decir, no se migró aún),
    crea la carpeta correspondiente y mueve el archivo. Finalmente, actualiza el registro
    asignando el nuevo valor de image_url como una lista.
    """
    if not product.image_url:
        return

    if isinstance(product.image_url, list):
        return

    filename = Path(product.image_url).name  # "vestidoDamazco_20241229234345_5.webp"
    folder_name = get_folder_name_from_filename(filename)  # "vestidoDamazco"
    product_folder = PRODUCTS_UPLOAD_DIR / folder_name
    product_folder.mkdir(parents=True, exist_ok=True)

    origen = BASE_UPLOAD_DIR / filename
    destino = product_folder / filename

    if origen.exists():
        print(f"Moviendo {origen} a {destino}")
        shutil.move(str(origen), str(destino))
        new_path = f"/uploads/CarpetasDeProductos/{folder_name}/{filename}"
        product.image_url = [new_path]
    else:
        print(f"El archivo {origen} no existe para el producto {product.id}")

async def main():
    async with SessionLocal() as session:
        stmt = select(Producto)
        result = await session.execute(stmt)
        products = result.scalars().all()

        for product in products:
            await migrate_product_image(product, session)

        await session.commit()
    print("Migración completada.")

if __name__ == "__main__":
    asyncio.run(main())
