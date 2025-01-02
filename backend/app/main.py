#main.py
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY
from fastapi.middleware.cors import CORSMiddleware
from app.routes import usuarios, categorias, productos
from app.routes.productos import generate_custom_errors
from fastapi.staticfiles import StaticFiles
from app.routes.authentication import router as auth_router
from app.routes.authGoogle import router as google_auth_router

app = FastAPI(
    title="Miuvuu API",
    version="0.1.0",
    debug=True
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://accounts.google.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(usuarios.router, prefix="/api", tags=["usuarios"])
app.include_router(auth_router, prefix="/api", tags=["autenticación"])
app.include_router(categorias.router, prefix="/api", tags=["categorias"])
app.include_router(productos.router, prefix="/api", tags=["productos"])
app.include_router(google_auth_router, prefix="/api/auth/google", tags=["autenticación con Google"])

@app.get("/")
def read_root():
    return {"message": "¡Bienvenido a Miuvuu!"}


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    custom_messages = generate_custom_errors(exc)
    return JSONResponse(
        status_code=HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": custom_messages},
    )

@app.options("/{path:path}")
async def handle_options_request():
    return JSONResponse(content={}, status_code=200)