from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.usuarios import Usuario
from app.schemas.usuarios import UsuarioCreate
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_usuario(db: AsyncSession, usuario: UsuarioCreate):
    db_usuario = Usuario(**usuario.dict())
    db.add(db_usuario)
    await db.commit()
    await db.refresh(db_usuario)
    return db_usuario


async def get_usuarios(db: AsyncSession):
    result = await db.execute(select(Usuario))
    return result.scalars().all()


async def get_usuario_by_id(db: AsyncSession, usuario_id: int):
    result = await db.execute(select(Usuario).filter(Usuario.id == usuario_id))
    return result.scalar_one_or_none()


async def delete_usuario(db: AsyncSession, usuario_id: int):
    # Obtener el usuario por su id
    usuario = await db.execute(select(Usuario).filter(Usuario.id == usuario_id))
    usuario = usuario.scalar_one_or_none()

    if usuario:
        # Eliminar el usuario
        await db.delete(usuario)
        await db.commit()
        return usuario
    return None  # Retorna None si el usuario no existe


async def update_usuario(
    db: AsyncSession, usuario_id: int, usuario_update: UsuarioCreate
):
    # Obtener el usuario por su id
    usuario = await db.execute(select(Usuario).filter(Usuario.id == usuario_id))
    usuario = usuario.scalar_one_or_none()

    if usuario:
        for key, value in usuario_update.dict(exclude={"contraseña"}).items():
            setattr(usuario, key, value)

        # Verificar si se incluye una nueva contraseña en los datos de actualización
        if usuario_update.contraseña:
            # Validar si la nueva contraseña cumple con requisitos específicos
            if not validate_password(usuario_update.contraseña):
                raise ValueError("La contraseña no cumple con los requisitos.")

            # Encriptar y actualizar la contraseña si se proporciona
            usuario.contraseña = pwd_context.hash(usuario_update.contraseña)

        # Guardar los cambios en la base de datos
        await db.commit()
        await db.refresh(usuario)
        return usuario

    return None  # Retorna None si el usuario no existe


def validate_password(contraseña: str) -> bool:
    return len(contraseña) >= 8
