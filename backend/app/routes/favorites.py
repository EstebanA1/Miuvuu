from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.usuarios import Usuario as User
from app.models.productos import Producto 
from sqlalchemy.future import select
from sqlalchemy import update
from pydantic import BaseModel

class FavoriteRequest(BaseModel):
    user_id: int

router = APIRouter()

async def verify_product_exists(product_id: int, db: AsyncSession) -> bool:
    """Verifica si un producto existe en la base de datos."""
    result = await db.execute(select(Producto).filter(Producto.id == product_id))
    product = result.scalars().first()
    return product is not None

@router.get("/favorites/{user_id}", summary="Obtener favoritos del usuario")
async def get_favorites(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"favorites": user.favoritos if user.favoritos else []}

@router.post("/favorites/{product_id}", summary="Agregar producto a favoritos")
async def add_favorite(
    product_id: int,
    favorite_request: FavoriteRequest,
    db: AsyncSession = Depends(get_db)
):
    if not await verify_product_exists(product_id, db):
        raise HTTPException(
            status_code=404,
            detail=f"El producto con ID {product_id} no existe"
        )

    result = await db.execute(select(User).filter(User.id == favorite_request.user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    current_favorites = user.favoritos if user.favoritos else []
    
    if product_id in current_favorites:
        raise HTTPException(status_code=400, detail="Producto ya está en favoritos")
    
    new_favorites = current_favorites + [product_id]
    
    stmt = (
        update(User)
        .where(User.id == favorite_request.user_id)
        .values(favoritos=new_favorites)
    )
    await db.execute(stmt)
    await db.commit()
    
    await db.refresh(user)
    
    return {"message": "Producto agregado a favoritos", "favorites": new_favorites}

@router.delete("/favorites/{product_id}", summary="Eliminar producto de favoritos")
async def remove_favorite(
    product_id: int,
    favorite_request: FavoriteRequest,
    db: AsyncSession = Depends(get_db)
):
    if not await verify_product_exists(product_id, db):
        raise HTTPException(
            status_code=404,
            detail=f"El producto con ID {product_id} no existe"
        )

    result = await db.execute(select(User).filter(User.id == favorite_request.user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    current_favorites = user.favoritos if user.favoritos else []
    
    if product_id not in current_favorites:
        raise HTTPException(status_code=400, detail="Producto no está en favoritos")
    
    new_favorites = [f for f in current_favorites if f != product_id]
    
    stmt = (
        update(User)
        .where(User.id == favorite_request.user_id)
        .values(favoritos=new_favorites)
    )
    await db.execute(stmt)
    await db.commit()
    
    await db.refresh(user)
    
    return {"message": "Producto eliminado de favoritos", "favorites": new_favorites}