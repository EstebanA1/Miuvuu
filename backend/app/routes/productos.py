from fastapi import APIRouter, Depends, HTTPException, status, Body, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.productos import Producto, ProductoCreate
from app.crud.productos import get_productos, get_producto, create_producto, update_producto, delete_producto
from app.validators.productos import ProductoValidator
from typing import Optional

router = APIRouter(prefix="/productos", tags=["productos"])

def generate_custom_errors(error):
    return {"error": "Error en los datos del producto", "detalles": str(error)}

# Obtener todos los productos
@router.get("/", response_model=list[Producto], response_description="Lista de todos los productos")
async def listar_productos(
    categoria: Optional[str] = None,
    genero: Optional[str] = None,
    searchQuery: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    return await get_productos(db, categoria=categoria, genero=genero, search_query=searchQuery)

# Obtener un producto por ID
@router.get("/{producto_id}", response_model=Producto, responses={404: {"description": "Producto no encontrado"}})
async def obtener_producto(producto_id: int, db: AsyncSession = Depends(get_db)):
    producto = await get_producto(db, producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado"
        )
    return producto

# Crear un nuevo producto
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
    # Valida los campos (si es necesario)
    ProductoValidator.validate_nombre(nombre)
    ProductoValidator.validate_precio(precio)
    ProductoValidator.validate_cantidad(cantidad)

    # Maneja la imagen
    image_url = None
    if image:
        # Guarda la imagen en una carpeta del servidor (implementa esto según tus necesidades)
        image_url = f"/uploads/{image.filename}"
        with open(f"uploads/{image.filename}", "wb") as buffer:
            buffer.write(await image.read())

    # Crea el producto
    producto_data = ProductoCreate(
        nombre=nombre,
        descripcion=descripcion,
        precio=precio,
        cantidad=cantidad,
        categoria_id=categoria_id,
        image_url=image_url,
    )
    return await create_producto(db, producto_data)




# Actualizar un producto
@router.put("/{producto_id}", response_model=Producto, responses={404: {"description": "Producto no encontrado"}})
async def actualizar_producto(producto_id: int, producto: ProductoCreate = Body(...), db: AsyncSession = Depends(get_db)):
    db_producto = await update_producto(db, producto_id, producto)
    if not db_producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado"
        )
    return db_producto

# Eliminar un producto
@router.delete("/{producto_id}", response_model=Producto, responses={404: {"description": "Producto no encontrado"}})
async def eliminar_producto(producto_id: int, db: AsyncSession = Depends(get_db)):
    db_producto = await delete_producto(db, producto_id)
    if not db_producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado"
        )
    return db_producto