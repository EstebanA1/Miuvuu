from fastapi import APIRouter, Depends, HTTPException, status, Query, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.productos import Producto, ProductoCreate, ProductoResponse
from app.crud.productos import get_productos, get_producto, create_producto, update_producto, delete_producto
from app.validators.productos import ProductoValidator
from typing import Optional, List
from PIL import Image
from pathlib import Path, PurePosixPath
from datetime import datetime
import shutil
import random
import re
import json 


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
    page: Optional[int] = Query(default=1, ge=1, description="Número de página"),
    limit: Optional[int] = Query(default=30, ge=1, le=100, description="Límite de productos por página"),
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await get_productos(
            db, 
            categoria=categoria, 
            genero=genero, 
            search_query=searchQuery,
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

@router.get("/{producto_id}", response_model=Producto, responses={404: {"description": "Producto no encontrado"}})
async def obtener_producto(producto_id: int, db: AsyncSession = Depends(get_db)):
    producto = await get_producto(db, producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado"
        )
    return producto

@router.post("/", response_model=Producto)
async def crear_producto(
    nombre: str = Form(...),
    descripcion: str = Form(...),
    precio: float = Form(...),
    cantidad: int = Form(...),
    categoria_id: int = Form(...),
    image: Optional[UploadFile] = File(None),
    additional_images: Optional[List[UploadFile]] = File(None),
    db: AsyncSession = Depends(get_db),
):
    # Validaciones
    ProductoValidator.validate_nombre(nombre)
    ProductoValidator.validate_precio(precio)
    ProductoValidator.validate_cantidad(cantidad)

    image_urls: List[str] = []
    # Genera la carpeta una sola vez para este producto.
    folder_name = generate_folder_name(nombre)
    product_folder = PRODUCTS_UPLOAD_DIR / folder_name
    product_folder.mkdir(parents=True, exist_ok=True)

    if image:
        try:
            unique_file_name = generate_unique_name(image.filename)
            extension = Path(image.filename).suffix
            # Guarda el archivo en la carpeta creada.
            image_path = product_folder / f"{unique_file_name}{extension}"
            with open(image_path, "wb") as buffer:
                buffer.write(await image.read())
            # Si la imagen no está en webp, conviértela.
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


@router.put("/{producto_id}", response_model=Producto)
async def actualizar_producto(
    producto_id: int,
    nombre: str = Form(...),
    descripcion: str = Form(...),
    precio: float = Form(...),
    cantidad: int = Form(...),
    categoria_id: int = Form(...),
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    ProductoValidator.validate_nombre(nombre)
    ProductoValidator.validate_precio(precio)
    ProductoValidator.validate_cantidad(cantidad)

    image_urls: Optional[List[str]] = None

    if image:
        db_producto_actual = await get_producto(db, producto_id)
        folder_name = None

        if db_producto_actual and db_producto_actual.image_url:
            old_img_value = db_producto_actual.image_url
            if isinstance(old_img_value, str):
                if old_img_value.startswith("["):
                    try:
                        parsed = json.loads(old_img_value)
                        if isinstance(parsed, list) and len(parsed) > 0:
                            old_image_url = parsed[0]
                        else:
                            old_image_url = ""
                    except Exception as e:
                        print(f"Error parsing old_image_url: {e}")
                        old_image_url = ""
                else:
                    old_image_url = old_img_value
            elif isinstance(old_img_value, list):
                old_image_url = old_img_value[0]
            else:
                old_image_url = ""

            print("Old image url:", old_image_url)
            prefix = "/uploads/CarpetasDeProductos/"
            if old_image_url.startswith(prefix):
                folder_name = old_image_url[len(prefix):].split("/")[0]
                print(f"Carpeta extraída del registro: {folder_name}")
            else:
                print("La URL antigua no tiene el formato esperado, se generará una nueva carpeta.")
        if not folder_name:
            folder_name = generate_folder_name(nombre)
            print(f"Se generó un nuevo folder_name: {folder_name}")

        product_folder = PRODUCTS_UPLOAD_DIR / folder_name
        product_folder.mkdir(parents=True, exist_ok=True)

        if db_producto_actual and db_producto_actual.image_url:
            try:
                old_image_url_fixed = "/" + old_image_url.lstrip("/")
                old_image_path = BASE_UPLOAD_DIR / PurePosixPath(old_image_url_fixed.lstrip("/"))
                if old_image_path.exists():
                    old_image_path.unlink()
                    print(f"Archivo antiguo eliminado: {old_image_path}")
            except Exception as e:
                print(f"Error al eliminar la imagen antigua: {e}")

        try:
            unique_file_name = generate_unique_name(image.filename)
            extension = Path(image.filename).suffix
            new_image_path = product_folder / f"{unique_file_name}{extension}"
            with open(new_image_path, "wb") as buffer:
                buffer.write(await image.read())

            if image.content_type != "image/webp":
                webp_image_path = convert_to_webp(new_image_path)
                try:
                    new_image_path.unlink()
                except Exception as e:
                    print(f"Error al eliminar el archivo original: {e}")
                final_image_name = webp_image_path.name
            else:
                final_image_name = new_image_path.name

            new_image_url = f"/uploads/CarpetasDeProductos/{folder_name}/{final_image_name}"
            image_urls = [new_image_url]
            print(f"Nuevo image_url generado: {new_image_url}")
        except Exception as e:
            print(f"Error al procesar la imagen en actualización: {e}")
            raise HTTPException(status_code=500, detail=f"Error al procesar la imagen: {str(e)}")

    producto_data = ProductoCreate(
        nombre=nombre,
        descripcion=descripcion,
        precio=precio,
        cantidad=cantidad,
        categoria_id=categoria_id,
        image_url=image_urls if image_urls else None
    )

    db_producto = await update_producto(db, producto_id, producto_data)
    if not db_producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    return db_producto



@router.delete("/{producto_id}", response_model=Producto, responses={404: {"description": "Producto no encontrado"}})
async def eliminar_producto(producto_id: int, db: AsyncSession = Depends(get_db)):
    producto_a_eliminar = await get_producto(db, producto_id)
    if not producto_a_eliminar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado"
        )
    
    print("producto_a_eliminar.image_url:", producto_a_eliminar.image_url)
    
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
        folder_path = Path(first_img_val.lstrip("/")).parent
        print(f"Carpeta identificada para eliminar: {folder_path}")
    else:
        print("No se encontró una URL de imagen válida.")

    db_producto = await delete_producto(db, producto_id)
    
    if folder_path:
        BASE_IMAGE_DIR = Path("uploads/CarpetasDeProductos") 
        if BASE_IMAGE_DIR in folder_path.parents or folder_path == BASE_IMAGE_DIR:
            if folder_path.exists():
                shutil.rmtree(folder_path)
                print(f"Carpeta eliminada: {folder_path}")
            else:
                print(f"La carpeta {folder_path} no existe.")
        else:
            print(f"Advertencia: La carpeta {folder_path} no está dentro de {BASE_IMAGE_DIR}. No se elimina.")
    
    return db_producto


def generate_custom_errors(error):
    return {"error": "Error en los datos del producto", "detalles": str(error)}