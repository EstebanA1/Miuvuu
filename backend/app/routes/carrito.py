from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.usuarios import Usuario
from app.models.productos import Producto
from pydantic import BaseModel
from sqlalchemy.future import select
from sqlalchemy import update

router = APIRouter(tags=['Carrito'])

class CartItem(BaseModel):
    user_id: int
    cantidad: int = 1
    color: str  
    talla: str 

async def verify_product_exists(product_id: int, db: AsyncSession):
    producto = await db.execute(select(Producto).filter(Producto.id == product_id))
    return producto.scalar_one_or_none()

@router.get("/carrito/{user_id}", summary="Obtener carrito del usuario")
async def get_cart(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await db.execute(select(Usuario).filter(Usuario.id == user_id))
    user = user.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"carrito": user.carrito}

@router.post("/carrito/agregar/{product_id}", summary="Agregar producto al carrito")
async def add_to_cart(
    product_id: int,
    payload: dict,
    db: AsyncSession = Depends(get_db)
):
    try:
        cart_item = CartItem(**payload["cart_item"])
        producto = await verify_product_exists(product_id, db)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        user = await db.execute(select(Usuario).filter(Usuario.id == cart_item.user_id))
        user = user.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        nuevo_carrito = user.carrito.copy() if user.carrito else []
        encontrado = False
        
        for item in nuevo_carrito:
            if (
                item["producto_id"] == product_id and
                item["color"] == cart_item.color and
                item["talla"] == cart_item.talla
            ):
                item["cantidad"] += cart_item.cantidad
                encontrado = True
                break
        
        if not encontrado:
            nuevo_carrito.append({
                "producto_id": product_id,
                "cantidad": cart_item.cantidad,
                "color": cart_item.color,
                "talla": cart_item.talla 
            })
        
        await db.execute(
            update(Usuario)
            .where(Usuario.id == cart_item.user_id)
            .values(carrito=nuevo_carrito)
        )
        await db.commit()
        
        return {"message": "Producto agregado al carrito", "carrito": nuevo_carrito}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/carrito/eliminar/{product_id}", summary="Eliminar producto del carrito")
async def remove_from_cart(
    product_id: int,
    payload: dict,
    db: AsyncSession = Depends(get_db)
):
    try:
        cart_item = CartItem(**payload["cart_item"])
        user = await db.execute(select(Usuario).filter(Usuario.id == cart_item.user_id))
        user = user.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        nuevo_carrito = [
            item for item in user.carrito
            if not (
                item["producto_id"] == product_id and
                item["color"] == cart_item.color and
                item["talla"] == cart_item.talla
            )
        ]
        
        await db.execute(
            update(Usuario)
            .where(Usuario.id == cart_item.user_id)
            .values(carrito=nuevo_carrito)
        )
        await db.commit()
        
        return {"message": "Producto eliminado del carrito", "carrito": nuevo_carrito}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
@router.put("/carrito/actualizar/{product_id}", summary="Actualizar cantidad de un producto en el carrito")
async def update_cart(
    product_id: int,
    payload: dict,
    db: AsyncSession = Depends(get_db)
):
    try:
        cart_item = CartItem(**payload["cart_item"])
        
        producto = await verify_product_exists(product_id, db)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        user = await db.execute(select(Usuario).filter(Usuario.id == cart_item.user_id))
        user = user.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        nuevo_carrito = []
        encontrado = False
        for item in user.carrito:
            if (
                item["producto_id"] == product_id and
                item["color"] == cart_item.color and
                item["talla"] == cart_item.talla
            ):
                item["cantidad"] = cart_item.cantidad
                encontrado = True
            nuevo_carrito.append(item)
        
        if not encontrado:
            raise HTTPException(status_code=404, detail="Producto no encontrado en el carrito")
        
        await db.execute(
            update(Usuario)
            .where(Usuario.id == cart_item.user_id)
            .values(carrito=nuevo_carrito)
        )
        await db.commit()
        
        return {"message": "Cantidad actualizada correctamente", "carrito": nuevo_carrito}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))