from fastapi import APIRouter, Depends, HTTPException
from app.database import get_db
from app.schemas.categorias import Categoria, CategoriaCreate
from app.crud.categorias import (
    get_categorias,
    get_categoria,
    create_categoria,
    delete_categoria,
    update_categoria
)
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/categorias", tags=["categorias"])

@router.get("/", response_model=list[Categoria])
async def listar_categorias(db: AsyncSession = Depends(get_db)):
    return await get_categorias(db)

@router.get("/{categoria_id}", response_model=Categoria)
async def obtener_categoria(categoria_id: int, db: AsyncSession = Depends(get_db)):
    categoria = await get_categoria(db, categoria_id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return categoria

@router.post("/", response_model=Categoria)
async def crear_categoria(categoria: CategoriaCreate, db: AsyncSession = Depends(get_db)):
    return await create_categoria(db, categoria)

@router.put("/{categoria_id}", response_model=Categoria)
async def actualizar_categoria(
    categoria_id: int, categoria: CategoriaCreate, db: AsyncSession = Depends(get_db)
):
    db_categoria = await update_categoria(db, categoria_id, categoria)
    if not db_categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return db_categoria

@router.delete("/{categoria_id}", response_model=Categoria)
async def eliminar_categoria(categoria_id: int, db: AsyncSession = Depends(get_db)):
    db_categoria = await delete_categoria(db, categoria_id)
    if not db_categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return db_categoria
