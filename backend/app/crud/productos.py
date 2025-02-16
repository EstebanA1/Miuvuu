from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.productos import Producto
from app.schemas.productos import ProductoCreate
from app.models.categorias import Categoria
from sqlalchemy.sql import func

async def get_producto(db: AsyncSession, producto_id: int):
    query = select(Producto).where(Producto.id == producto_id)
    result = await db.execute(query)
    return result.scalars().first()

async def get_productos(db: AsyncSession, categoria: str = None, genero: str = None, search_query: str = None, page: int = 1, limit: int = 15, sortBy: str = "default"):
    query = select(Producto).join(Categoria)
    
    if categoria:
        query = query.filter(Categoria.nombre == categoria)
    if genero:
        query = query.filter(Categoria.genero == genero)
    if search_query:
        query = query.filter(Producto.nombre.ilike(f"%{search_query}%"))
    
    if sortBy and sortBy != "default":
        if sortBy == "price_asc":
            query = query.order_by(Producto.precio.asc(), Producto.id.asc())
        elif sortBy == "price_desc":
            query = query.order_by(Producto.precio.desc(), Producto.id.desc())
        elif sortBy == "name_asc":
            query = query.order_by(Producto.nombre.asc(), Producto.id.asc())
        elif sortBy == "name_desc":
            query = query.order_by(Producto.nombre.desc(), Producto.id.desc())


    count_query = select(func.count()).select_from(query)
    total = await db.scalar(count_query)

    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    productos = result.scalars().all()
    
    return {
        "products": productos,
        "total": total
    }

async def create_producto(db: AsyncSession, producto: ProductoCreate):
    print("Datos recibidos:", producto) 

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
