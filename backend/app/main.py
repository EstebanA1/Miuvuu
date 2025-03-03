import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException, Body
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
import re

from app.config import FRONTEND_URL, NGROK_TOKEN, EMAIL_PASS, EMAIL_USER
from app.routes import usuarios, categorias, productos
from app.routes.authentication import router as auth_router
from app.routes.authGoogle import router as google_auth_router
from app.routes.favorites import router as favorites_router
from app.routes.carrito import router as carrito_router
from app.routes.pagos import router as pagos_router

load_dotenv()

if os.getenv("DEVELOPMENT", "false").lower() in ["true", "1", "yes"]:
    from pyngrok import ngrok
    print("NGROK_TOKEN:", NGROK_TOKEN)  
    ngrok.set_auth_token(NGROK_TOKEN)
    tunnel = ngrok.connect(8000)
    os.environ["API_URL"] = tunnel.public_url
    os.environ["MERCADOPAGO_NOTIFICATION_URL"] = tunnel.public_url + "/api/pagos/notification"
    print("Ngrok tunnel started:", tunnel.public_url)

app = FastAPI(title="Miuvuu API", version="0.1.0", debug=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "https://accounts.google.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(usuarios.router, prefix="/api", tags=["usuarios"])
app.include_router(auth_router, prefix="/api", tags=["autenticación"])
app.include_router(categorias.router, prefix="/api", tags=["categorias"])
app.include_router(productos.router, prefix="/api", tags=["productos"])
app.include_router(google_auth_router, prefix="/api/auth/google", tags=["autenticación con Google"])
app.include_router(favorites_router, prefix="/api", tags=["favoritos"])
app.include_router(carrito_router, prefix="/api", tags=["carrito"])
app.include_router(pagos_router, prefix="/api/pagos", tags=["pagos"])

# Rutas básicas
@app.get("/")
def read_root():
    return {"message": "¡Bienvenido a Miuvuu!"}

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    from app.routes.productos import generate_custom_errors
    return JSONResponse(status_code=HTTP_422_UNPROCESSABLE_ENTITY, content={"detail": generate_custom_errors(exc)})

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print("Unhandled Exception:", exc)
    return JSONResponse(status_code=500, content={"detail": str(exc)}, headers={"Access-Control-Allow-Origin": "*"})

@app.post("/send-email")
async def send_email(email: str = Body(..., embed=True)):
    pattern = r'^[^@]+@[^@]+\.[^@]+$'
    if not re.match(pattern, email):
        raise HTTPException(status_code=400, detail="Formato de correo electrónico no válido")

    recipient_email = email
    sender_email = EMAIL_USER
    sender_password = EMAIL_PASS

    if not sender_email or not sender_password:
        raise HTTPException(status_code=500, detail="Credenciales de email no configuradas")

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = recipient_email
    msg['Subject'] = "Bienvenido a Miuvuu!"
    
    body_text = (
        "Hola,\n\n"
        "¡Gracias por suscribirte a Miuvuu! Estamos emocionados de tenerte en nuestra comunidad.\n"
        "Pronto recibirás nuestras novedades y ofertas exclusivas.\n\n"
        "Saludos,\n"
        "El equipo de Miuvuu"
    )
    msg.attach(MIMEText(body_text, 'plain'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(sender_email, sender_password)
        server.send_message(msg)  
        server.quit()
        
        return JSONResponse(
            content={"message": "Correo enviado correctamente"},
            status_code=200
        )
    except Exception as e:
        print(f"Error al enviar el correo: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al enviar el correo")
    finally:
        if 'server' in locals():
            try:
                server.quit()
            except:
                pass