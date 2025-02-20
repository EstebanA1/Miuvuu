# Miuvuu - Tienda de ropa minimalista

Miuvuu es una tienda de ropa con un diseño sobrio y moderno. Este proyecto fue creado como práctica para implementar un e-commerce utilizando tecnologías actuales.

## Tecnologías utilizadas

- **Frontend:** HTML, CSS, JavaScript, React
- **Backend:** FastAPI (Python)
- **Base de datos:** PostgreSQL

## Funcionalidades

El sistema cuenta con tres roles principales, cada uno con funcionalidades específicas:

### Administrador
* **Gestión de usuarios:**
  * Crear, modificar, eliminar y visualizar cuentas de usuario
  * Requiere la contraseña del usuario para modificar cuentas
* Acceso a todas las funcionalidades de roles inferiores

### Vendedor
* **Gestión de productos:**
  * Crear, modificar, eliminar y visualizar productos
  * Gestión de hasta 6 imágenes por producto
  * Sistema de gestión automática de almacenamiento (creación/eliminación de carpetas de imágenes)
* Acceso a todas las funcionalidades de usuario

### Usuario
* **Navegación y búsqueda:**
  * Visualización de productos
  * Búsqueda por categorías (género y/o productos)
  * Buscador integrado
  * Ordenamiento de productos por:
    * Precio (ascendente/descendente)
    * Nombre (ascendente/descendente)
  * Sistema de paginación para optimizar la carga
* **Gestión de cuenta:**
  * Registro de usuario nuevo
  * Inicio de sesión con credenciales
  * Inicio de sesión con Google
  * Actualización de datos personales (requiere contraseña)
* **Funcionalidades de compra:**
  * Lista de favoritos
  * Carrito de compras
  * Sistema de pago integrado con MercadoPago (modo Sandbox)
    * Simulación completa del proceso de pago
    * Entorno de pruebas seguro
* **Suscripción:**
  * Sistema de suscripción por correo electrónico
  * Envío automático de correo de bienvenida

## Estructura del proyecto

```
miuvuu/
├───backend/
|    ├── app/
|    │   ├── __init__.py
|    │   ├── __pycache__
|    │   ├── auth/
|    │   ├── crud/
|    │   ├── models/
|    │   ├── routes/
|    │   ├── schemas/
|    │   ├── validators/
|    │   ├── config.py
|    │   ├── database.py
|    │   ├── helpers.py
|    │   └── main.py
|    ├── uploads/
|    ├── __init__.py
|    ├── .env
|    ├── requirements.txt
|    └── test.py
├───frontend/
|    ├── src/
|    │   ├── assets/
|    │   ├── components/
|    │   │   ├── Auth/
|    │   │   ├── Carousel/
|    │   │   ├── Cart/
|    │   │   ├── Content/
|    │   │   ├── ErrorPage/
|    │   │   ├── Favorites/
|    │   │   ├── FooterPages/
|    │   │   ├── Header/
|    │   │   ├── ManageUser/
|    │   │   ├── Pagination/
|    │   │   ├── Pagos/
|    │   │   ├── Productos/
|    │   │   ├── Profile/
|    │   │   └── Utils/
|    │   ├── config/
|    │   ├── context/
|    │   ├── services/
|    │   ├── App.css
|    │   ├── App.jsx
|    │   └── main.jsx
|    ├── public/
|    ├── node_modules/
|    ├── index.html
|    ├── package.json
|    ├── package-lock.json
|    ├── vite.config.js
|    └── eslint.config.js
├── .gitignore
├── Dockerfile
└── README.md
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