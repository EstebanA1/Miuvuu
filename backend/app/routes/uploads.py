from fastapi import APIRouter, Form, UploadFile, File, HTTPException, Depends
from app.models.productos import Producto as ProductoModel
from sqlalchemy.orm import Session
from pathlib import Path
from app.database import get_db
from PIL import Image

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def convert_to_webp(image_path: Path) -> Path:
    """Convierte una imagen a formato .webp si no está ya en ese formato."""
    with Image.open(image_path) as img:
        webp_path = image_path.with_suffix('.webp')
        img.save(webp_path, format="WEBP", quality=100)
    return webp_path

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
        image_path = None
        webp_image_path = None
        if image:
            image_path = UPLOAD_DIR / image.filename
            with open(image_path, "wb") as buffer:
                buffer.write(image.file.read())
            
            if image.content_type != "image/webp":
                webp_image_path = convert_to_webp(image_path)
                image_path.unlink()
            else:
                webp_image_path = image_path

        producto = ProductoModel(
            nombre=nombre,
            descripcion=descripcion,
            precio=precio,
            cantidad=cantidad,
            categoria_id=categoria_id,
            image_url=str(webp_image_path) if webp_image_path else None,
        )
        db.add(producto)
        db.commit()
        db.refresh(producto)

        return {"message": "Producto creado exitosamente", "producto": producto}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear producto: {str(e)}")
