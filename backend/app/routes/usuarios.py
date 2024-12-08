from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.crud.usuarios import (
    create_usuario,
    get_usuarios,
    get_usuario_by_id,
    delete_usuario,
    update_usuario,
)
from app.schemas.usuarios import UsuarioCreate, Usuario, UsuarioSalida

router = APIRouter()


@router.post("/usuarios/", response_model=Usuario)
async def crear_usuario(usuario: UsuarioCreate, db: AsyncSession = Depends(get_db)):
    try:
        db_usuario = await create_usuario(db, usuario)
        return db_usuario
    except Exception as e:
        raise HTTPException(
            status_code=400, detail="Error al crear usuario. Detalles: " + str(e)
        )


@router.get("/usuarios/", response_model=list[UsuarioSalida])
async def read_usuarios(db: AsyncSession = Depends(get_db)):
    try:
        return await get_usuarios(db)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail="Error al obtener los usuarios. Detalles: " + str(e)
        )


@router.get("/usuarios/{usuario_id}", response_model=UsuarioSalida)
async def read_usuario_by_id(usuario_id: int, db: AsyncSession = Depends(get_db)):
    usuario = await get_usuario_by_id(db, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


@router.delete("/usuarios/{usuario_id}", response_model=UsuarioSalida)
async def eliminar_usuario(usuario_id: int, db: AsyncSession = Depends(get_db)):
    usuario = await delete_usuario(db, usuario_id)
    if usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


@router.put("/usuarios/{usuario_id}", response_model=UsuarioSalida)
async def actualizar_usuario(
    usuario_id: int,
    usuario_update: UsuarioCreate,
    db: AsyncSession = Depends(get_db),
):
    usuario = await update_usuario(db, usuario_id, usuario_update)
    if usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario
