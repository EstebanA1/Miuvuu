from fastapi import APIRouter, Form, UploadFile, File, HTTPException, Depends
from app.models import ProductoModel  # Modelo de SQLAlchemy o similar
from sqlalchemy.orm import Session
from pathlib import Path
from app.database import get_db
from fastapi import Depends
router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/productos/")
async def create_producto(
    nombre: str = Form(...),
    descripcion: str = Form(...),
    precio: float = Form(...),
    cantidad: int = Form(...),
    categoria_id: int = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db), 
):
    try:
        # Manejar la carga de la imagen
        image_path = None
        if image:
            image_path = UPLOAD_DIR / image.filename
            with open(image_path, "wb") as buffer:
                buffer.write(image.file.read())

        # Crear el producto en la base de datos
        producto = ProductoModel(
            nombre=nombre,
            descripcion=descripcion,
            precio=precio,
            cantidad=cantidad,
            categoria_id=categoria_id,
            image_url=str(image_path) if image else None,
        )
        db.add(producto)
        db.commit()
        db.refresh(producto)

        return {"message": "Producto creado exitosamente", "producto": producto}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear producto: {str(e)}")