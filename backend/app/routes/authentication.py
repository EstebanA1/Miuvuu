from app.crud.usuarios import get_usuario_by_correo, get_usuario_by_nombre, verify_password
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from app.database import get_db
from pydantic import BaseModel
import jwt
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

SECRET_KEY = "tu_clave_secreta_muy_segura"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

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
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60 
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
    response = JSONResponse(
        content={"message": "Logout exitoso"}
    )
    response.delete_cookie(key="access_token")
    return response

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
