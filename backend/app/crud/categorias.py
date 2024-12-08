from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import NoResultFound
from app.models.categorias import Categoria
from app.schemas.categorias import CategoriaCreate

async def get_categorias(db: AsyncSession):
    result = await db.execute(select(Categoria))
    return result.scalars().all()

async def get_categoria(db: AsyncSession, categoria_id: int):
    query = select(Categoria).where(Categoria.id == categoria_id)
    try:
        result = await db.execute(query)
        return result.scalars().one()
    except NoResultFound:
        return None

async def create_categoria(db: AsyncSession, categoria: CategoriaCreate):
    db_categoria = Categoria(
        nombre=categoria.nombre,
        descripcion=categoria.descripcion,
        genero=categoria.genero
    )
    db.add(db_categoria)
    await db.commit()
    await db.refresh(db_categoria)
    return db_categoria

async def update_categoria(db: AsyncSession, categoria_id: int, categoria: CategoriaCreate):
    query = select(Categoria).where(Categoria.id == categoria_id)
    result = await db.execute(query)
    db_categoria = result.scalars().first()
    if not db_categoria:
        return None
    db_categoria.nombre = categoria.nombre
    db_categoria.descripcion = categoria.descripcion
    db_categoria.genero = categoria.genero 
    await db.commit()
    await db.refresh(db_categoria)
    return db_categoria

async def delete_categoria(db: AsyncSession, categoria_id: int):
    query = select(Categoria).where(Categoria.id == categoria_id)
    result = await db.execute(query)
    db_categoria = result.scalars().first()
    if db_categoria:
        await db.delete(db_categoria)
        await db.commit()
    return db_categoria
