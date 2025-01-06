# authGoogle.py
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.usuarios import get_usuario_by_correo, create_usuario
from app.schemas.usuarios import UsuarioCreate
from app.database import get_db
from app.auth.auth_utils import create_access_token
import aiohttp
import json
import base64
import urllib.parse
from fastapi import status
import os
from dotenv import load_dotenv

router = APIRouter()
load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")
FRONTEND_URL = os.getenv("FRONTEND_URL")

@router.get("/login")
async def google_login():
    auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent"
    }
    return RedirectResponse(url=f"{auth_url}?{urllib.parse.urlencode(params)}")

@router.get("/callback")
async def google_callback(code: str, db: AsyncSession = Depends(get_db)):
    try:
        async with aiohttp.ClientSession() as session:
            token_response = await session.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "redirect_uri": GOOGLE_REDIRECT_URI,
                    "grant_type": "authorization_code",
                }
            )
            token_data = await token_response.json()
            
            if not token_response.ok:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Error al obtener el token de Google"
                )

            user_response = await session.get(
                "https://www.googleapis.com/oauth2/v1/userinfo",
                headers={"Authorization": f"Bearer {token_data['access_token']}"},
            )
            user_info = await user_response.json()

            if not user_response.ok:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Error al obtener información del usuario"
                )

        user = await get_usuario_by_correo(db, user_info['email'])
        
        if not user:
            user_data = UsuarioCreate(
                nombre=user_info['name'],
                correo=user_info['email'],
                contraseña='google_auth',
                rol='usuario'
            )
            user = await create_usuario(db, user_data)

        access_token = create_access_token({"sub": user.correo})
        
        user_data = {
            'id': user.id,
            'email': user.correo,
            'nombre': user.nombre,
            'rol': user.rol
        }
        
        encoded_data = base64.b64encode(json.dumps(user_data).encode()).decode()
        
        return RedirectResponse(
            url=f"{FRONTEND_URL}/auth/callback?token={access_token}&data={encoded_data}"
        )
        
    except Exception as e:
        print(f"Error in Google callback: {str(e)}")
        return RedirectResponse(url=f"{FRONTEND_URL}/auth/error")