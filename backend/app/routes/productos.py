from fastapi import APIRouter, Depends, HTTPException, status, Query, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.productos import Producto as ProductoModel
from app.schemas.productos import Producto as ProductoSchema, ProductoCreate, ProductoResponse
from app.crud.productos import get_productos, get_producto, create_producto, update_producto, delete_producto
from app.validators.productos import ProductoValidator
from typing import Optional, List
from PIL import Image
from pathlib import Path
from datetime import datetime
import shutil
import random
import re
import json 
from sqlalchemy import select
from app.helpers import extract_file_path_from_url, extract_folder_from_url, normalize_url


router = APIRouter(prefix="/productos", tags=["productos"])

BASE_UPLOAD_DIR = Path("uploads")
BASE_IMAGE_DIR = Path("uploads/CarpetasDeProductos")
BASE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
PRODUCTS_UPLOAD_DIR = BASE_UPLOAD_DIR / "CarpetasDeProductos"
PRODUCTS_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def convert_to_webp(image_path: Path) -> Path:
    """Convierte una imagen a formato .webp si no está ya en ese formato."""
    with Image.open(image_path) as img:
        webp_path = image_path.with_suffix('.webp')
        img.save(webp_path, format="WEBP", quality=100)
    return webp_path

def generate_unique_name(original_name: str) -> str:
    sanitized_name = re.sub(r'[^a-zA-Z0-9_-]', '_', original_name.rsplit('.', 1)[0])
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_number = random.randint(1, 1000)
    return f"{sanitized_name}_{timestamp}_{random_number}"

def generate_folder_name(product_name: str) -> str:
    sanitized = re.sub(r'[^a-zA-Z0-9_-]', '_', product_name)
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    rand = random.randint(1, 1000)
    return f"{sanitized}_{timestamp}_{rand}"

@router.get("/", response_model=ProductoResponse)
async def listar_productos(
    categoria: Optional[str] = None,
    genero: Optional[str] = None,
    searchQuery: Optional[str] = None,
    sortBy: Optional[str] = Query(
        default="default", 
        description="Ordenamiento: price_asc, price_desc, name_asc, name_desc, newest"
    ),
    page: Optional[int] = Query(default=1, ge=1, description="Número de página"),
    limit: Optional[int] = Query(default=30, ge=1, le=100, description="Límite de productos por página"),
    db: AsyncSession = Depends(get_db)
):
    if sortBy == "newest":
        sortBy = "created_at_desc"
    
    try:
        result = await get_productos(
            db, 
            categoria=categoria, 
            genero=genero, 
            search_query=searchQuery,
            sortBy=sortBy,
            page=page,
            limit=limit
        )
        return ProductoResponse(
            products=result["products"],
            total=result["total"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/{producto_id}", response_model=ProductoSchema, responses={404: {"description": "Producto no encontrado"}})
async def obtener_producto(producto_id: int, db: AsyncSession = Depends(get_db)):
    producto = await get_producto(db, producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado"
        )
    return producto

@router.post("/", response_model=ProductoSchema)
async def crear_producto(
    nombre: str = Form(...),
    descripcion: str = Form(...),
    precio: float = Form(...),
    cantidad: int = Form(...),
    categoria_id: int = Form(...),
    image: Optional[UploadFile] = File(None),
    additional_images: List[UploadFile] = File(default=[]),
    db: AsyncSession = Depends(get_db),
):
    ProductoValidator.validate_nombre(nombre)
    ProductoValidator.validate_precio(precio)
    ProductoValidator.validate_cantidad(cantidad)

    image_urls: List[str] = []
    folder_name = generate_folder_name(nombre)
    product_folder = PRODUCTS_UPLOAD_DIR / folder_name
    product_folder.mkdir(parents=True, exist_ok=True)

    if image:
        try:
            unique_file_name = generate_unique_name(image.filename)
            extension = Path(image.filename).suffix
            image_path = product_folder / f"{unique_file_name}{extension}"
            with open(image_path, "wb") as buffer:
                buffer.write(await image.read())
            if image.content_type != "image/webp":
                webp_image_path = convert_to_webp(image_path)
                try:
                    image_path.unlink()
                except Exception as e:
                    print(f"Error al eliminar el archivo original: {e}")
                final_image_name = webp_image_path.name
            else:
                final_image_name = image_path.name
            # Construye la URL que se guardará.
            image_url = f"/uploads/CarpetasDeProductos/{folder_name}/{final_image_name}"
            image_urls.append(image_url)
        except Exception as e:
            print(f"Error al procesar la imagen: {e}")
            raise HTTPException(status_code=500, detail=f"Error al procesar la imagen: {str(e)}")

    if additional_images:
        for add_image in additional_images:
            try:
                print(f"Procesando imagen adicional: {add_image.filename}")
                unique_file_name = generate_unique_name(add_image.filename)
                extension = Path(add_image.filename).suffix
                image_path = product_folder / f"{unique_file_name}{extension}"
                with open(image_path, "wb") as buffer:
                    buffer.write(await add_image.read())
                if add_image.content_type != "image/webp":
                    webp_image_path = convert_to_webp(image_path)
                    try:
                        image_path.unlink()
                    except Exception as e:
                        print(f"Error al eliminar el archivo original: {e}")
                    final_image_name = webp_image_path.name
                else:
                    final_image_name = image_path.name
                add_image_url = f"/uploads/CarpetasDeProductos/{folder_name}/{final_image_name}"
                image_urls.append(add_image_url)
            except Exception as e:
                print(f"Error al procesar una imagen adicional: {e}")
                raise HTTPException(status_code=500, detail=f"Error al procesar una imagen adicional: {str(e)}")


    producto_data = ProductoCreate(
        nombre=nombre,
        descripcion=descripcion,
        precio=precio,
        cantidad=cantidad,
        categoria_id=categoria_id,
        image_url=image_urls if image_urls else None
    )
    return await create_producto(db, producto_data)




@router.put("/{producto_id}", response_model=ProductoSchema)
async def actualizar_producto(
    producto_id: int,
    nombre: str = Form(...),
    descripcion: str = Form(...),
    precio: float = Form(...),
    cantidad: int = Form(...),
    categoria_id: int = Form(...),
    existing_images: Optional[str] = Form(None),
    images: List[UploadFile] = File(default=[]),
    db: AsyncSession = Depends(get_db)
):
    # 1. Recuperar el producto desde la BD.
    query = select(ProductoModel).where(ProductoModel.id == producto_id)
    result = await db.execute(query)
    db_producto = result.scalars().first()
    if not db_producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # 2. Procesar las imágenes existentes que llegan en el formulario.
    existing_image_urls = []
    if existing_images:
        try:
            parsed = json.loads(existing_images)
            if isinstance(parsed, list):
                existing_image_urls = parsed
            else:
                existing_image_urls = [parsed]
        except Exception as e:
            existing_image_urls = []

    # Normalizamos las URLs de la imagen enviada desde el formulario
    existing_image_urls = [normalize_url(url) for url in existing_image_urls]

    # 3. Extraer las imágenes que tenía el producto (old_images) y normalizarlas.
    old_images = []
    if db_producto.image_url:
        if isinstance(db_producto.image_url, list):
            old_images = db_producto.image_url
        elif isinstance(db_producto.image_url, str):
            try:
                parsed = json.loads(db_producto.image_url)
                if isinstance(parsed, list):
                    old_images = parsed
                else:
                    old_images = [db_producto.image_url]
            except Exception:
                old_images = [db_producto.image_url]
    old_images = [normalize_url(url) for url in old_images]

    # 4. Determinar cuáles imágenes fueron removidas (comparando las listas normalizadas)
    removed_images = [img for img in old_images if img not in existing_image_urls]
    for img_url in removed_images:
        file_path = extract_file_path_from_url(img_url)
        if file_path.exists():
            try:
                file_path.unlink()  # elimina el archivo
                print(f"Se eliminó el archivo: {file_path}")
            except Exception as e:
                print(f"Error al eliminar {file_path}: {e}")

    # Iniciamos el arreglo final con las imágenes que el usuario decidió mantener.
    final_image_urls = list(existing_image_urls)

    # 5. Determinar el folder_name: se reutiliza el de las imágenes existentes o de la BD.
    folder_name = ""
    for img in existing_image_urls:
        folder_name = extract_folder_from_url(img)
        if folder_name:
            break
    if not folder_name and db_producto.image_url:
        if isinstance(db_producto.image_url, list) and len(db_producto.image_url) > 0:
            folder_name = extract_folder_from_url(db_producto.image_url[0])
        elif isinstance(db_producto.image_url, str):
            try:
                parsed = json.loads(db_producto.image_url)
                if isinstance(parsed, list) and len(parsed) > 0:
                    folder_name = extract_folder_from_url(parsed[0])
            except Exception:
                folder_name = extract_folder_from_url(db_producto.image_url)
    if not folder_name:
        folder_name = generate_folder_name(nombre)
        print(f"Se generó un nuevo folder_name: {folder_name}")

    product_folder = PRODUCTS_UPLOAD_DIR / folder_name
    product_folder.mkdir(parents=True, exist_ok=True)

    # 6. Procesar las nuevas imágenes subidas.
    if images:
        for image in images:
            try:
                unique_file_name = generate_unique_name(image.filename)
                extension = Path(image.filename).suffix
                new_image_path = product_folder / f"{unique_file_name}{extension}"
                with open(new_image_path, "wb") as buffer:
                    buffer.write(await image.read())

                if image.content_type != "image/webp":
                    webp_image_path = convert_to_webp(new_image_path)
                    try:
                        new_image_path.unlink()  # elimina el archivo original
                    except Exception as e:
                        print(f"Error al eliminar el archivo original: {e}")
                    final_image_name = webp_image_path.name
                else:
                    final_image_name = new_image_path.name

                new_image_url = f"/uploads/CarpetasDeProductos/{folder_name}/{final_image_name}"
                final_image_urls.append(new_image_url)
            except Exception as e:
                print(f"Error al procesar la imagen en actualización: {e}")
                raise HTTPException(status_code=500, detail=f"Error al procesar la imagen: {str(e)}")

    # 7. Actualizar el producto.
    producto_data = ProductoCreate(
        nombre=nombre,
        descripcion=descripcion,
        precio=precio,
        cantidad=cantidad,
        categoria_id=categoria_id,
        image_url=final_image_urls if final_image_urls else None
    )

    db_producto = await update_producto(db, producto_id, producto_data)
    if not db_producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return db_producto




@router.delete("/{producto_id}", response_model=ProductoSchema, responses={404: {"description": "Producto no encontrado"}})
async def eliminar_producto(producto_id: int, db: AsyncSession = Depends(get_db)):
    producto_a_eliminar = await get_producto(db, producto_id)
    if not producto_a_eliminar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado"
        )
        
    first_img_val = ""
    if producto_a_eliminar.image_url:
        if isinstance(producto_a_eliminar.image_url, list):
            if len(producto_a_eliminar.image_url) > 0:
                first_img_val = producto_a_eliminar.image_url[0]
        elif isinstance(producto_a_eliminar.image_url, str):
            try:
                parsed = json.loads(producto_a_eliminar.image_url)
                if isinstance(parsed, list) and len(parsed) > 0:
                    first_img_val = parsed[0]
                else:
                    first_img_val = producto_a_eliminar.image_url
            except Exception as e:
                first_img_val = producto_a_eliminar.image_url
    
    folder_path = None
    if first_img_val:
        # Usamos el helper para obtener la ruta del archivo, y luego tomamos su carpeta (parent)
        folder_path = extract_file_path_from_url(first_img_val).parent
        print(f"Carpeta identificada para eliminar: {folder_path}")
    else:
        print("No se encontró una URL de imagen válida.")
    
    db_producto = await delete_producto(db, producto_id)
    
    if folder_path:
        BASE_IMAGE_DIR = Path("uploads/CarpetasDeProductos")
        # Comprobamos que la carpeta a eliminar esté realmente dentro de BASE_IMAGE_DIR
        try:
            folder_path.relative_to(BASE_IMAGE_DIR)
            if folder_path.exists():
                shutil.rmtree(folder_path)
                print(f"Carpeta eliminada: {folder_path}")
            else:
                print(f"La carpeta {folder_path} no existe.")
        except ValueError:
            print(f"Advertencia: La carpeta {folder_path} no está dentro de {BASE_IMAGE_DIR}. No se elimina.")
    
    return db_producto




def generate_custom_errors(error):
    return {"error": "Error en los datos del producto", "detalles": str(error)}