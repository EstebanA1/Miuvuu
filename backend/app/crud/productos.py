from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import NoResultFound
from app.models.productos import Producto
from app.schemas.productos import ProductoCreate
from app.models.categorias import Categoria
from sqlalchemy.future import select

async def get_productos(db, categoria: str = None, genero: str = None):
    query = select(Producto).join(Categoria)
      
    if categoria:
        query = query.filter(Categoria.nombre == categoria)

    if genero:
        query = query.filter(Categoria.genero == genero)

    result = await db.execute(query)
    return result.scalars().all()


async def get_producto(db: AsyncSession, producto_id: int):
    query = select(Producto).where(Producto.id == producto_id)
    try:
        result = await db.execute(query)
        return result.scalars().one()
    except NoResultFound:
        return None

async def create_producto(db: AsyncSession, producto: ProductoCreate):
    print("Datos recibidos:", producto)  # <-- Log temporal para depuración

    db_producto = Producto(
        nombre=producto.nombre,
        descripcion=producto.descripcion,
        precio=producto.precio,
        cantidad=producto.cantidad,
        categoria_id=producto.categoria_id,
        image_url=producto.image_url,
    )
    db.add(db_producto)
    await db.commit()
    await db.refresh(db_producto)
    return db_producto


async def update_producto(db: AsyncSession, producto_id: int, producto: ProductoCreate):
    query = select(Producto).where(Producto.id == producto_id)
    result = await db.execute(query)
    db_producto = result.scalars().first()

    if not db_producto:
        return None

    db_producto.nombre = producto.nombre
    db_producto.descripcion = producto.descripcion
    db_producto.precio = producto.precio
    db_producto.cantidad = producto.cantidad
    db_producto.categoria_id = producto.categoria_id
    db_producto.image_url = producto.image_url

    await db.commit()
    await db.refresh(db_producto)
    return db_producto

async def delete_producto(db: AsyncSession, producto_id: int):
    query = select(Producto).where(Producto.id == producto_id)
    result = await db.execute(query)
    db_producto = result.scalars().first()
    if db_producto:
        await db.delete(db_producto)
        await db.commit()
    return db_producto