from fastapi import APIRouter, Depends, HTTPException, status, Body, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.productos import Producto, ProductoCreate
from app.crud.productos import get_productos, get_producto, create_producto, update_producto, delete_producto
from app.validators.productos import ProductoValidator
from typing import Optional
from PIL import Image
from pathlib import Path

router = APIRouter(prefix="/productos", tags=["productos"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def convert_to_webp(image_path: Path) -> Path:
    """Convierte una imagen a formato .webp si no está ya en ese formato."""
    with Image.open(image_path) as img:
        webp_path = image_path.with_suffix('.webp')
        img.save(webp_path, format="WEBP", quality=100)
    return webp_path

@router.get("/", response_model=list[Producto], response_description="Lista de todos los productos")
async def listar_productos(
    categoria: Optional[str] = None,
    genero: Optional[str] = None,
    searchQuery: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    return await get_productos(db, categoria=categoria, genero=genero, search_query=searchQuery)


@router.get("/{producto_id}", response_model=Producto, responses={404: {"description": "Producto no encontrado"}})
async def obtener_producto(producto_id: int, db: AsyncSession = Depends(get_db)):
    producto = await get_producto(db, producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado"
        )
    return producto


@router.post("/", response_model=Producto, responses={422: {"description": "Error en los datos de entrada"}})
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

    if image and image.content_type not in ["image/png", "image/jpeg", "image/jpg", "image/webp"]:
        raise HTTPException(status_code=400, detail="Formato de imagen no soportado, se permite .png, .jpeg, .jpg y .webp")

    image_url = None
    if image:
        image_path = UPLOAD_DIR / image.filename
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


@router.put("/{producto_id}", response_model=Producto, responses={404: {"description": "Producto no encontrado"}})
async def actualizar_producto(producto_id: int, producto: ProductoCreate = Body(...), db: AsyncSession = Depends(get_db)):
    db_producto = await update_producto(db, producto_id, producto)
    if not db_producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado"
        )
    return db_producto


@router.delete("/{producto_id}", response_model=Producto, responses={404: {"description": "Producto no encontrado"}})
async def eliminar_producto(producto_id: int, db: AsyncSession = Depends(get_db)):
    db_producto = await delete_producto(db, producto_id)
    if not db_producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado"
        )
    return db_producto

def generate_custom_errors(error):
    return {"error": "Error en los datos del producto", "detalles": str(error)}
