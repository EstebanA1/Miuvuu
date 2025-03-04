# Miuvuu - Tienda de ropa minimalista

Miuvuu es una tienda de ropa con un diseño sobrio y moderno. 
Este proyecto fue creado como práctica para implementar un e-commerce utilizando tecnologías actuales.

## 🚀 Tecnologías Clave

| Capa                | Tecnologías                                              |
|---------------------|----------------------------------------------------------|
| **Frontend**        | React, Vite, Axios                                       |
| **Backend**         | FastAPI, SQLAlchemy, Alembic, Uvicorn                    |
| **Base de Datos**   | PostgreSQL                                               |
| **Infraestructura** | Docker, Docker Compose                                   |
| **Autenticación**   | OAuth2 (Google), JWT                                     |
| **Pagos**           | MercadoPago API (Sandbox)                                |

## 📋 Funcionalidades

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

## 🛠️ Instalación

El proyecto puede ser ejecutado de dos maneras: usando Docker (recomendado) o instalación manual.

### 🐳 Opción 1: Usando Docker (Recomendado)

#### Requisitos Previos
- Docker 20.10+
- Docker Compose 2.0+
- 2 GB de RAM disponibles

#### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tuusuario/miuvuu.git
cd miuvuu
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
```

El archivo .env debe contener las siguientes variables:

## Configuración de Base de Datos
DATABASE_URL=postgresql+asyncpg://usuario:contraseña@postgres/miuvuu

## Configuración de Google OAuth2
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/api/auth/google/callback

## URLs
FRONTEND_URL=http://localhost:5173

## Configuración de Email
EMAIL_USER=tu_email
EMAIL_PASS=tu_password_de_aplicacion

## Configuración de MercadoPago
MERCADOPAGO_ACCESS_TOKEN=tu_access_token
MERCADOPAGO_NOTIFICATION_URL=tu_url_de_notificacion

## Token de Ngrok (para desarrollo)
NGROK_TOKEN=tu_token

3. **Construir y ejecutar servicios**
```bash
docker-compose up --build
```

4. **Acceder a la aplicación**
- Frontend: http://localhost:5173
- Backend (Documentación): http://localhost:8000/docs
- PostgreSQL: localhost:5432 (usuario: postgres, contraseña: a)

🗄️ Gestión de Base de Datos
- Datos iniciales: Se cargan automáticamente desde backup.sql
- Persistencia: Los datos se guardan entre reinicios
- Resetear: docker-compose down -v && docker-compose up

### 💻 Opción 2: Instalación Manual

#### Requisitos Previos
- Python 3.9+
- Node.js y npm
- PostgreSQL

#### 1. Clonar el repositorio
```bash
git clone https://github.com/tuusuario/miuvuu.git
cd miuvuu
```

#### 2. Configurar el Backend
1. Crear y activar entorno virtual:
```bash
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

2. Instalar dependencias:
```bash
cd backend
pip install -r requirements.txt
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

4. Iniciar servidor:
```bash
uvicorn app.main:app --reload
```

#### 3. Configurar el Frontend
1. Instalar dependencias:
```bash
cd frontend
npm install
```

2. Iniciar servidor de desarrollo:
```bash
npm run dev
```

## 📁 Estructura del Proyecto

```
miuvuu/
├───backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── auth/
│   │   ├── crud/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── validators/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── helpers.py
│   │   └── main.py
│   ├── uploads/
│   ├── __init__.py
│   ├── .env
│   ├── alembic/
│   ├── requirements.txt
│   └── test.py
├───frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── Carousel/
│   │   │   ├── Cart/
│   │   │   ├── Content/
│   │   │   ├── ErrorPage/
│   │   │   ├── Favorites/
│   │   │   ├── FooterPages/
│   │   │   ├── Header/
│   │   │   ├── ManageUser/
│   │   │   ├── Pagination/
│   │   │   ├── Pagos/
│   │   │   ├── Productos/
│   │   │   ├── Profile/
│   │   │   └── Utils/
│   │   ├── config/
│   │   ├── context/
│   │   ├── services/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── Dockerfile.frontend
└── README.md
```

## 💳 Cómo Realizar una Compra

Para probar el sistema de pago integrado con MercadoPago (modo Sandbox), sigue estos pasos:

1. **Ingresa al navegador en modo incógnito**

2. **Agrega productos al carrito y accede a la sección de pago**
   * Selecciona productos
   * Ve al carrito de compras
   * Haz clic en la opción para proceder al pago

3. **Ingresa los siguientes datos de tarjeta**
   * Número: `5416 7526 0258 2580`
   * Nombre: `APRO`
   * Vencimiento: `11/30`
   * CVV: `123`

4. **Completa los datos de documento**
   * Tipo: `Otro`
   * Número: `123456789`

5. **Selecciona las cuotas disponibles**

6. **Ingresa el correo del comprador**
   * Email: `test_user_1822712226@testuser.com`

7. **Haz clic en "Pagar"**

> **Nota:** Estos datos solo funcionan en el entorno de pruebas (Sandbox) de MercadoPago y no realizan cargos reales.