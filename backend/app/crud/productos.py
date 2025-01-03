from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import NoResultFound
from app.models.productos import Producto
from app.schemas.productos import ProductoCreate
from app.models.categorias import Categoria
from sqlalchemy.future import select

async def get_productos(db, categoria: str = None, genero: str = None, search_query: str = None):
    query = select(Producto).join(Categoria)
    
    # Filtrar por categoría
    if categoria:
        query = query.filter(Categoria.nombre == categoria)

    # Filtrar por género
    if genero:
        query = query.filter(Categoria.genero == genero)

    # Filtrar por nombre del producto
    if search_query:
        query = query.filter(Producto.nombre.ilike(f"%{search_query}%"))

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
    
    if producto.image_url is not None:
        db_producto.image_url = producto.image_url

    await db.commit()
    await db.refresh(db_producto)
    return db_producto

async def delete_producto(db: AsyncSession, producto_id: int):
    query = select(Producto).where(Producto.id == producto_id)
    result = await db.execute(query)
    db_producto = result.scalars().first()
    if not db_producto:
        print(f"Producto con ID {producto_id} no encontrado")
        return None
    await db.delete(db_producto)
    await db.commit()
    print(f"Producto con ID {producto_id} eliminado correctamente")
    return db_producto
