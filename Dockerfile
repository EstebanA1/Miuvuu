# Etapa 1: Construir el frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Instalar dependencias del frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

# Copiar el código del frontend
COPY frontend/ ./

# Construir el frontend
RUN npm run build
# Verificar si la carpeta dist existe y su contenido
RUN ls -la || true
RUN ls -la dist/ || echo "Directorio dist no existe o está vacío"

# Etapa 2: Configurar el backend
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar y instalar dependencias del backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt || pip install --no-cache-dir -r requirements.txt --break-system-packages

# Copiar el código del backend
COPY backend/ ./

# Crear directorio static y uploads si no existen
RUN mkdir -p static uploads

# Copiar los archivos construidos del frontend
COPY --from=frontend-builder /app/frontend/dist/ ./static/
RUN echo "Contenido del directorio static:" && ls -la static/ || echo "Directorio static vacío o no existe"

# Exponer el puerto (Railway asignará PORT automáticamente)
ENV PORT=8000
EXPOSE 8000

# Comando para ejecutar la aplicación
# Usamos un script de shell para interpretar la variable de entorno correctamente
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]