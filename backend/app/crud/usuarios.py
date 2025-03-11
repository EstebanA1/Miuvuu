from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.usuarios import Usuario
from app.schemas.usuarios import UsuarioCreate, UsuarioUpdateProfile
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
        usuario_dict['carrito'] = usuario_dict.get('carrito', [])

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

        # Validar carrito
        if usuario_dict['carrito']:
            carrito_ids = [item['producto_id'] for item in usuario_dict['carrito']]
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

async def get_usuario_by_id(db: AsyncSession, usuario_id: int):
    result = await db.execute(select(Usuario).filter(Usuario.id == usuario_id))
    usuario = result.scalar_one_or_none()
    
    if usuario:
        usuario.favoritos = usuario.favoritos or []
        usuario.carrito = usuario.carrito or []
        usuario.metodo_pago = usuario.metodo_pago or []
    
    return usuario

async def get_usuarios(db: AsyncSession):
    result = await db.execute(select(Usuario))
    usuarios = result.scalars().all()
    
    for usuario in usuarios:
        usuario.favoritos = usuario.favoritos or []
        usuario.carrito = usuario.carrito or []
        usuario.metodo_pago = usuario.metodo_pago or []
    
    return usuarios

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

async def update_usuario_profile(db: AsyncSession, usuario_id: int, update_data: UsuarioUpdateProfile):
    usuario = await get_usuario_by_id(db, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if update_data.nueva_contraseña or update_data.confirmar_nueva_contraseña:
        if not (update_data.nueva_contraseña and update_data.confirmar_nueva_contraseña):
            raise HTTPException(status_code=400, detail="Para cambiar la contraseña, se deben enviar 'nueva_contraseña' y 'confirmar_nueva_contraseña'")
        
        if update_data.nueva_contraseña != update_data.confirmar_nueva_contraseña:
            raise HTTPException(status_code=400, detail="Las nuevas contraseñas no coinciden")
        
        if update_data.current_password is not None and not verify_password(update_data.current_password, usuario.contraseña):
            raise HTTPException(status_code=400, detail="La contraseña actual no es correcta")
        
        usuario.contraseña = pwd_context.hash(update_data.nueva_contraseña)
    
    if update_data.nombre is not None:
        usuario.nombre = update_data.nombre
    if update_data.correo is not None:
        usuario.correo = update_data.correo
    if update_data.metodo_pago is not None:
        usuario.metodo_pago = update_data.metodo_pago
    if update_data.rol is not None:
        usuario.rol = update_data.rol
    if update_data.favoritos is not None:
        usuario.favoritos = update_data.favoritos
    if update_data.carrito is not None:
        usuario.carrito = update_data.carrito

    db.add(usuario)
    await db.commit()
    await db.refresh(usuario)
    return usuario

