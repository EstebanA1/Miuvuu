from app.schemas.usuarios import UsuarioCreate, Usuario, UsuarioSalida
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.usuarios import Usuario
from app.models.productos import Producto
from app.database import get_db
from app.crud.usuarios import (
    create_usuario,
    get_usuarios,
    get_usuario_by_id,
    delete_usuario,
    update_usuario,
    get_usuario_by_correo
    )

router = APIRouter()


@router.post("/usuarios/", response_model=UsuarioSalida)
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

@router.get("/usuarios/correo/{correo}", response_model=UsuarioSalida)
async def read_usuario_by_correo(correo: str, db: AsyncSession = Depends(get_db)):
    usuario = await get_usuario_by_correo(db, correo)
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


async def agregar_a_favoritos(db: AsyncSession, usuario_id: int, producto_id: int):
    # Verificar que el producto existe
    producto = await db.execute(select(Producto).filter(Producto.id == producto_id))
    producto = producto.scalar_one_or_none()

    if not producto:
        raise HTTPException(
            status_code=404, detail="El producto no existe"
        )

    # Obtener usuario
    usuario = await db.execute(select(Usuario).filter(Usuario.id == usuario_id))
    usuario = usuario.scalar_one_or_none()

    if not usuario:
        raise HTTPException(
            status_code=404, detail="Usuario no encontrado"
        )

    # Agregar producto a favoritos si no está ya presente
    if producto_id not in usuario.favoritos:
        usuario.favoritos.append(producto_id)
        db.add(usuario)
        await db.commit()
        await db.refresh(usuario)

    return usuario


async def agregar_al_carrito(db: AsyncSession, usuario_id: int, producto_id: int, cantidad: int):
    # Verificar que el producto existe
    producto = await db.execute(select(Producto).filter(Producto.id == producto_id))
    producto = producto.scalar_one_or_none()

    if not producto:
        raise HTTPException(
            status_code=404, detail="El producto no existe"
        )

    # Obtener usuario
    usuario = await db.execute(select(Usuario).filter(Usuario.id == usuario_id))
    usuario = usuario.scalar_one_or_none()

    if not usuario:
        raise HTTPException(
            status_code=404, detail="Usuario no encontrado"
        )

    # Actualizar el carrito
    carrito = usuario.carrito or []
    for item in carrito:
        if item["producto_id"] == producto_id:
            item["cantidad"] += cantidad
            break
    else:
        carrito.append({"producto_id": producto_id, "cantidad": cantidad})

    usuario.carrito = carrito
    db.add(usuario)
    await db.commit()
    await db.refresh(usuario)

    return usuario
