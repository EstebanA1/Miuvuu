# Miuvuu - Tienda de ropa minimalista

Miuvuu es una tienda de ropa con un diseño sobrio y moderno. Este proyecto fue creado como práctica para implementar un e-commerce utilizando tecnologías actuales.

## Tecnologías utilizadas

- **Frontend:** HTML, CSS, JavaScript, React
- **Backend:** FastAPI (Python)
- **Base de datos:** PostgreSQL

## Funcionalidades

- **Detalle de productos**: Cada producto tiene una página de detalle que muestra su descripción, precio, disponibilidad y opciones de compra.
- **Gestión de carrito de compras**: Los usuarios pueden agregar y eliminar productos de su carrito de compras.
- **Registro y autenticación de usuarios**: Los usuarios pueden crear una cuenta y acceder a la tienda. Esta funcionalidad está prevista en una fase posterior.

## Estructura del proyecto

```
miuvuu/
├───backend/
|    ├── app/
|    │   ├── __init__.py              # Indica que 'app' es un paquete de Python
|    │   ├── main.py                  # Punto de entrada de la aplicación FastAPI
|    │   ├── models/                  # Define los modelos de datos (usuarios, productos, etc.)
|    │   │   ├── user.py              # Modelo para representar a un usuario
|    │   │   ├── product.py           # Modelo para representar un producto
|    │   ├── routes/                  # Contiene las rutas de la API
|    │   │   ├── users.py             # Rutas relacionadas con usuarios
|    │   │   ├── products.py          # Rutas relacionadas con productos
|    │   ├── crud/                    # Operaciones CRUD sobre los modelos
|    │   │   ├── user_crud.py         # Operaciones CRUD para usuarios
|    │   │   ├── product_crud.py      # Operaciones CRUD para productos
|    │   ├── schemas/                 # Define las estructuras de datos Pydantic
|    │   │   ├── user.py              # Esquema para validar datos de usuario
|    │   │   ├── product.py           # Esquema para validar datos de producto
|    │   ├── validators/              # Validaciones personalizadas
|    │   │   ├── email.py             # Validador de direcciones de correo
|    │   └── database.py              # Configuración de la base de datos
|    └──  uploads/                    # Almacena archivos subidos por los usuarios
|    └── requirements.txt             # Lista de dependencias de Python
|    └── .env                         # Variables de entorno
├───frontend/
|    ├── src/
|    │   ├── assets/                  # Archivos estáticos (imágenes, fuentes)
|    │   ├── components/              # Componentes reutilizables de React
|    │   │   ├── Navbar.jsx           # Componente de barra de navegación
|    │   │   ├── ProductList.jsx      # Componente de lista de productos
|    │   ├── eservices/               # Servicios externos consumidos
|    │   ├── index.css                # Hoja de estilos global
|    │   ├── App.css                  # Estilos específicos de la aplicación
|    │   ├── App.jsx                  # Componente principal de la aplicación
|    │   └── main.jsx                 # Punto de entrada de la aplicación
|    ├── public/                      # Archivos estáticos servidos directamente
|    ├── package.json                 # Dependencias de Node.js
|    ├── package-lock.json            # Lock file de dependencias
|    ├── index.html                   # Archivo HTML principal
|    └── vite.config.js               # Configuración de Vite
├── Dockerfile                        # Instrucciones para construir la imagen Docker
└── README.md                         # Documentación del proyecto
```

## Instrucciones para ejecutar

### 1. Clonar el repositorio
```bash
git clone https://github.com/tuusuario/miuvuu.git
cd miuvuu
```

### 2. Configurar el backend
1. Asegúrate de tener Python 3.9 o superior instalado.
2. Crea un entorno virtual e instala las dependencias:
   ```bash
   python3 -m venv venv
   . venv/bin/activate
   pip install -r backend/requirements.txt
   ```
3. Configura las variables de entorno necesarias en un archivo `.env` en la carpeta `backend/`.
4. Inicializa la base de datos PostgreSQL y ejecuta las migraciones.
5. Inicia el servidor FastAPI:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

### 3. Configurar el frontend
1. Asegúrate de tener Node.js y npm instalados.
2. Instala las dependencias del frontend:
   ```bash
   cd frontend
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm start
   ```

Ahora deberías poder acceder a la aplicación Miuvuu en tu navegador en `http://localhost:3000`. 
El backend se ejecutará en `http://localhost:8000`.