from app.crud.usuarios import get_usuario_by_correo, get_usuario_by_nombre, verify_password, create_usuario as create_new_user
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import JSONResponse
from app.database import get_db
from pydantic import BaseModel
import logging
from app.auth.auth_utils import create_access_token, verify_google_token
from app.models.usuarios import Usuario
from app.auth.auth_utils import SECRET_KEY, ALGORITHM
import jwt
from jwt.exceptions import PyJWTError


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

class LoginData(BaseModel):
    correo: str | None = None
    nombre: str | None = None
    contraseña: str

    def get_identifier(self) -> str:
        return self.correo or self.nombre or ""

@router.post("/auth/login")
async def login(login_data: LoginData, db: AsyncSession = Depends(get_db)):
    try:
        identifier = login_data.get_identifier()
        
        if not identifier:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debe proporcionar un correo o nombre"
            )

        user = None
        if login_data.correo:
            user = await get_usuario_by_correo(db, login_data.correo)
        elif login_data.nombre:
            user = await get_usuario_by_nombre(db, login_data.nombre)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas"
            )
        
        if not verify_password(login_data.contraseña, user.contraseña):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas"
            )
        
        access_token = create_access_token(
            data={"sub": user.correo}
        )
        
        response = JSONResponse(
            content={
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": user.id,
                    "email": user.correo,
                    "nombre": user.nombre,
                    "rol": user.rol
                }
            }
        )
        response.set_cookie(
            key="access_token",
            value=f"Bearer {access_token}",
            httponly=True,
            max_age=30 * 60  # 30 minutos
        )
        return response

    except Exception as e:
        logger.error(f"Error en el login: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@router.post("/auth/logout")
async def logout():
    response = JSONResponse(content={"message": "Logout exitoso"})
    response.delete_cookie(key="access_token")
    return response

@router.post("/auth/google")
async def google_login(token: str, db: AsyncSession = Depends(get_db)):
    try:
        idinfo = await verify_google_token(token)
        
        user = await get_usuario_by_correo(db, idinfo["email"])
        if not user:
            user = await create_new_user(db, {
                "correo": idinfo["email"],
                "nombre": idinfo["name"],
                "rol": "usuario"
            })

        access_token = create_access_token(data={"sub": user.correo})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.correo,
                "nombre": user.nombre,
                "rol": user.rol
            }
        }
    except Exception as e:
        logger.error(f"Error en Google login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al autenticar con Google"
        )
        
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> Usuario:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        correo: str = payload.get("sub")
        if correo is None:
            raise credentials_exception
    except PyJWTError:
        raise credentials_exception

    user = await get_usuario_by_correo(db, correo)
    if user is None:
        raise credentials_exception
    return user
