from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models.pedidos import Pedido
from app.models.usuarios import Usuario 
import asyncio

router = APIRouter()

@router.get("/usuarios/{usuario_id}/pedidos")
async def get_pedidos_usuario(usuario_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Usuario).filter(Usuario.id == usuario_id))
    usuario = result.scalar_one_or_none()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    result = await db.execute(select(Pedido).filter(Pedido.usuario_id == usuario_id))
    pedidos = result.scalars().all()
    return pedidos


@router.get("/pedidos/{pedido_id}")
async def update_order_status(pedido_id: int, db: AsyncSession, new_status: str, delay: int):
    await asyncio.sleep(delay)
    result = await db.execute(select(Pedido).filter(Pedido.id == pedido_id))
    pedido = result.scalar_one_or_none()
    if pedido:
        pedido.estado = new_status
        await db.commit()

@router.put("/usuarios/{usuario_id}/finalizar-orden")
async def finalizar_orden(
    usuario_id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Usuario).filter(Usuario.id == usuario_id))
    usuario = result.scalar_one_or_none()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    cart = usuario.carrito
    if not cart:
        raise HTTPException(status_code=400, detail="El carrito está vacío")

    total = sum(item['precio'] * item['cantidad'] for item in cart)

    nuevo_pedido = Pedido(
        detalles=cart,
        total=total,
        estado="en proceso",
        usuario_id=usuario_id
    )
    db.add(nuevo_pedido)

    usuario.carrito = []  
    await db.commit()
    await db.refresh(nuevo_pedido)

    background_tasks.add_task(update_order_status, nuevo_pedido.id, db, "en camino", 600)
    background_tasks.add_task(update_order_status, nuevo_pedido.id, db, "finalizado", 3600)

    return {"message": "Orden finalizada, carrito vaciado", "pedido": nuevo_pedido}

