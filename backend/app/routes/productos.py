from fastapi import APIRouter, Depends, HTTPException, status, Query, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.productos import Producto, ProductoCreate, ProductoResponse
from app.crud.productos import get_productos, get_producto, create_producto, update_producto, delete_producto
from app.validators.productos import ProductoValidator
from typing import Optional
from PIL import Image
from pathlib import Path
from datetime import datetime
import random
import re

router = APIRouter(prefix="/productos", tags=["productos"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def convert_to_webp(image_path: Path) -> Path:
    """Convierte una imagen a formato .webp si no está ya en ese formato."""
    with Image.open(image_path) as img:
        webp_path = image_path.with_suffix('.webp')
        img.save(webp_path, format="WEBP", quality=100)
    return webp_path

def generate_unique_name(original_name: str) -> str:
    sanitized_name = re.sub(r'[^a-zA-Z0-9_-]', '_', original_name.rsplit('.', 1)[0])
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_number = random.randint(1, 10)
    return f"{sanitized_name}_{timestamp}_{random_number}"

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
    db: AsyncSession = Depends(get_db),
):
    ProductoValidator.validate_nombre(nombre)
    ProductoValidator.validate_precio(precio)
    ProductoValidator.validate_cantidad(cantidad)

    image_url = None
    if image:
        unique_name = generate_unique_name(image.filename)
        image_path = UPLOAD_DIR / f"{unique_name}{Path(image.filename).suffix}"
        with open(image_path, "wb") as buffer:
            buffer.write(await image.read())
        
        if image.content_type != "image/webp":
            webp_image_path = convert_to_webp(image_path)
            image_path.unlink()
            image_url = f"/uploads/{webp_image_path.name}"
        else:
            image_url = f"/uploads/{image_path.name}"

    producto_data = ProductoCreate(
        nombre=nombre,
        descripcion=descripcion,
        precio=precio,
        cantidad=cantidad,
        categoria_id=categoria_id,
        image_url=image_url,
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

    image_url = None
    if image:
        db_producto_actual = await get_producto(db, producto_id)
        if db_producto_actual and db_producto_actual.image_url:
            old_image_path = UPLOAD_DIR / Path(db_producto_actual.image_url).name
            if old_image_path.exists():
                try:
                    old_image_path.unlink()
                except Exception as e:
                    print(f"Error al eliminar la imagen antigua: {e}")

        if image.content_type not in ["image/png", "image/jpeg", "image/jpg", "image/webp"]:
            raise HTTPException(
                status_code=400, 
                detail="Formato de imagen no soportado, se permite .png, .jpeg, .jpg y .webp"
            )
        
        unique_name = generate_unique_name(image.filename)
        image_path = UPLOAD_DIR / f"{unique_name}{Path(image.filename).suffix}"
        
        with open(image_path, "wb") as buffer:
            buffer.write(await image.read())
        
        if image.content_type != "image/webp":
            webp_image_path = convert_to_webp(image_path)
            image_path.unlink()  
            image_url = f"/uploads/{webp_image_path.name}"
        else:
            image_url = f"/uploads/{image_path.name}"

    producto_data = ProductoCreate(
        nombre=nombre,
        descripcion=descripcion,
        precio=precio,
        cantidad=cantidad,
        categoria_id=categoria_id,
        image_url=image_url if image_url else None  
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
        image_path = UPLOAD_DIR / Path(producto_a_eliminar.image_url).name
        if image_path.exists():
            try:
                image_path.unlink()
            except Exception as e:
                print(f"Error al eliminar la imagen del producto: {e}")
    
    return db_producto

def generate_custom_errors(error):
    return {"error": "Error en los datos del producto", "detalles": str(error)}
