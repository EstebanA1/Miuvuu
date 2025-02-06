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
import random
import re

router = APIRouter(prefix="/productos", tags=["productos"])

BASE_UPLOAD_DIR = Path("uploads")
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
        if db_producto_actual and db_producto_actual.image_url:
            old_image_url = db_producto_actual.image_url[0]
            try:
                p = PurePosixPath(old_image_url)
                if p.is_absolute() and len(p.parts) >= 5:
                    existing_folder = p.parts[3]  # Ejemplo: 'collarMujerCorazonPlata'
                else:
                    existing_folder = generate_folder_name(nombre)
            except Exception as e:
                print(f"Error extrayendo carpeta de old_image_url: {e}")
                existing_folder = generate_folder_name(nombre)
        else:
            existing_folder = generate_folder_name(nombre)
        
        folder_name = existing_folder
        product_folder = PRODUCTS_UPLOAD_DIR / folder_name
        product_folder.mkdir(parents=True, exist_ok=True)

        try:
            if db_producto_actual and db_producto_actual.image_url:
                old_image_url = db_producto_actual.image_url[0]
                p_old = PurePosixPath(old_image_url)
                old_image_path = BASE_UPLOAD_DIR / Path(*p_old.parts[1:])  # omite la barra inicial
                if old_image_path.exists():
                    try:
                        old_image_path.unlink()
                    except Exception as e:
                        print(f"Error al eliminar la imagen antigua: {e}")
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
            image_url = f"/uploads/CarpetasDeProductos/{folder_name}/{final_image_name}"
            image_urls = [image_url]
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
    
    db_producto = await delete_producto(db, producto_id)
    
    if producto_a_eliminar.image_url:
        try:
            for img_url in producto_a_eliminar.image_url:
                relative_path = img_url.lstrip("/")
                image_path = Path(relative_path)
                if image_path.exists():
                    try:
                        image_path.unlink()
                        print(f"Imagen eliminada: {image_path}")
                    except Exception as e:
                        print(f"Error al eliminar la imagen {image_path}: {e}")
                else:
                    print(f"La imagen {image_path} no existe.")
            
            first_img_path = Path(producto_a_eliminar.image_url[0].lstrip("/"))
            folder_path = first_img_path.parent
            if folder_path.exists() and not any(folder_path.iterdir()):
                folder_path.rmdir()
                print(f"Carpeta eliminada: {folder_path}")
        except Exception as e:
            print(f"Error al procesar la eliminación de imágenes: {e}")
    
    return db_producto

def generate_custom_errors(error):
    return {"error": "Error en los datos del producto", "detalles": str(error)}