# Despliegue en Railway

Este documento contiene instrucciones para desplegar el proyecto Miuvuu en Railway.

## Requisitos previos

1. Tener una cuenta en [Railway](https://railway.app/)
2. Tener instalado el CLI de Railway (opcional)

## Pasos para el despliegue

### 1. Crear un nuevo proyecto en Railway

- Inicia sesión en [Railway](https://railway.app/)
- Haz clic en "New Project"
- Selecciona "Deploy from GitHub repo"
- Conecta tu repositorio de GitHub y selecciona el repositorio de Miuvuu

### 2. Configurar variables de entorno

En la sección "Variables" de tu proyecto en Railway, agrega las siguientes variables de entorno:

```
DEVELOPMENT=false
API_URL=https://[tu-proyecto].up.railway.app
FRONTEND_URL=https://[tu-proyecto].up.railway.app
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_REDIRECT_URI=https://[tu-proyecto].up.railway.app/api/auth/google/callback
DATABASE_URL=postgresql://postgres:password@containers-us-west-XXX.railway.app:XXXX/railway
EMAIL_USER=tu-email
EMAIL_PASS=tu-password
MERCADOPAGO_ACCESS_TOKEN=tu-token
MERCADOPAGO_NOTIFICATION_URL=https://[tu-proyecto].up.railway.app/api/pagos/notification
```

Reemplaza los valores con tus propias credenciales y URLs.

### 3. Configurar la base de datos PostgreSQL

- En Railway, haz clic en "New"
- Selecciona "Database" y luego "PostgreSQL"
- Una vez creada, Railway proporcionará la URL de conexión en las variables de entorno

### 4. Despliegue

Railway detectará automáticamente los archivos de configuración (railway.json, Procfile) y desplegará tu aplicación.

El proceso de despliegue incluye:
1. Construcción del frontend (React/Vite)
2. Instalación de dependencias del backend (FastAPI)
3. Ejecución de migraciones de base de datos (Alembic)
4. Inicio del servidor backend

### 5. Verificar el despliegue

Una vez completado el despliegue, puedes acceder a tu aplicación en la URL proporcionada por Railway.

## Solución de problemas

Si encuentras problemas durante el despliegue, puedes revisar los logs en la sección "Deployments" de tu proyecto en Railway.

Problemas comunes:
- Variables de entorno mal configuradas
- Errores en las migraciones de base de datos
- Problemas de permisos en archivos estáticos

## Comandos útiles del CLI de Railway

```bash
# Iniciar sesión
railway login

# Vincular proyecto
railway link

# Ver variables de entorno
railway variables

# Desplegar manualmente
railway up

# Ver logs
railway logs
``` 