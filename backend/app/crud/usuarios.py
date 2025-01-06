from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.usuarios import Usuario
from app.schemas.usuarios import UsuarioCreate
from passlib.context import CryptContext
from fastapi import HTTPException
from sqlalchemy.dialects.postgresql import ARRAY
from app.models.productos import Producto

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12  
)

async def create_usuario(db: AsyncSession, usuario: UsuarioCreate):
    hashed_password = pwd_context.hash(usuario.contraseña)
    usuario_dict = usuario.dict()

    try:
        usuario_dict['contraseña'] = hashed_password
        usuario_dict['metodo_pago'] = usuario_dict.get('metodo_pago', []) or []
        usuario_dict['rol'] = usuario_dict.get('rol', 'usuario')
        usuario_dict['favoritos'] = usuario_dict.get('favoritos', [])
        usuario_dict['carrito_compra'] = usuario_dict.get('carrito_compra', [])

        if not isinstance(usuario_dict['metodo_pago'], list):
            raise ValueError("El campo 'metodo_pago' debe ser una lista.")

        # Validar favoritos
        if usuario_dict['favoritos']:
            query_favoritos = select(Producto.id).filter(Producto.id.in_(usuario_dict['favoritos']))
            productos_favoritos = await db.execute(query_favoritos)
            ids_favoritos_validos = {row[0] for row in productos_favoritos}
            favoritos_invalidos = set(usuario_dict['favoritos']) - ids_favoritos_validos
            if favoritos_invalidos:
                raise HTTPException(
                    status_code=400,
                    detail=f"Los siguientes IDs de favoritos no existen: {list(favoritos_invalidos)}"
                )

        # Validar carrito_compra
        if usuario_dict['carrito_compra']:
            carrito_ids = [item['producto_id'] for item in usuario_dict['carrito_compra']]
            query_carrito = select(Producto.id).filter(Producto.id.in_(carrito_ids))
            productos_carrito = await db.execute(query_carrito)
            ids_carrito_validos = {row[0] for row in productos_carrito}
            carrito_invalidos = set(carrito_ids) - ids_carrito_validos
            if carrito_invalidos:
                raise HTTPException(
                    status_code=400,
                    detail=f"Los siguientes IDs de productos en el carrito no existen: {list(carrito_invalidos)}"
                )

        # Crear usuario
        db_usuario = Usuario(**usuario_dict)
        db.add(db_usuario)
        await db.commit()
        await db.refresh(db_usuario)
        return db_usuario

    except Exception as e:
        print(f"Error al crear usuario: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {e}")



async def get_usuarios(db: AsyncSession):
    result = await db.execute(select(Usuario))
    return result.scalars().all()

async def get_usuario_by_id(db: AsyncSession, usuario_id: int):
    result = await db.execute(select(Usuario).filter(Usuario.id == usuario_id))
    return result.scalar_one_or_none()

async def get_usuario_by_correo(db: AsyncSession, correo: str):
    result = await db.execute(select(Usuario).where(Usuario.correo == correo))
    return result.scalar_one_or_none()

async def get_usuario_by_nombre(db: AsyncSession, nombre: str):
    result = await db.execute(select(Usuario).where(Usuario.nombre == nombre))
    return result.scalar_one_or_none()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        print(f"Error verificando contraseña: {e}")
        return False

async def delete_usuario(db: AsyncSession, usuario_id: int):
    usuario = await db.execute(select(Usuario).filter(Usuario.id == usuario_id))
    usuario = usuario.scalar_one_or_none()

    if usuario:
        await db.delete(usuario)
        await db.commit()
        return usuario
    return None

async def update_usuario(db: AsyncSession, usuario_id: int, usuario_update: UsuarioCreate):
    usuario = await db.execute(select(Usuario).filter(Usuario.id == usuario_id))
    usuario = usuario.scalar_one_or_none()

    if usuario:
        update_data = usuario_update.dict(exclude_unset=True)
        
        if "contraseña" in update_data:
            update_data["contraseña"] = pwd_context.hash(update_data["contraseña"])
            
        for key, value in update_data.items():
            setattr(usuario, key, value)

        await db.commit()
        await db.refresh(usuario)
        return usuario

    return None