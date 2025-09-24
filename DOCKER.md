# Docker Setup Guide

Este documento explica cómo usar Docker para ejecutar la aplicación Test Products API.

## 🐳 Configuración de Docker

### Prerrequisitos

- Docker Desktop instalado y ejecutándose
- Docker Compose v2.0+
- Git

### Estructura de Archivos Docker

```
test-products/
├── Dockerfile                 # Imagen multi-stage para producción
├── docker-compose.yml         # Orquestación de servicios (producción)
├── docker-compose.dev.yml     # Orquestación de servicios (desarrollo)
├── .dockerignore             # Archivos a ignorar en build
├── init-db/                  # Scripts de inicialización de DB
│   └── 01-init.sql
└── env.example               # Variables de entorno de ejemplo
```

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar con tus valores
nano .env
```

**Variables requeridas:**
```env
# Contentful (obtener de tu espacio)
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_DELIVERY_TOKEN=your_delivery_token
CONTENTFUL_CONTENT_TYPE=product

# JWT (cambiar en producción)
JWT_SECRET=your-super-secret-jwt-key
```

### 2. Iniciar Servicios

```bash
# Producción (recomendado)
docker-compose up -d

# Desarrollo con hot-reload
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Verificar Estado

```bash
# Ver logs
docker-compose logs -f

# Verificar servicios
docker-compose ps

# Health check
curl http://localhost:3000/api/v1/health
```

## 📋 Comandos Disponibles

### Scripts NPM

```bash
# Construcción
npm run docker:build              # Imagen de producción
npm run docker:build:dev          # Imagen de desarrollo

# Ejecución individual
npm run docker:run                # Contenedor de producción
npm run docker:run:dev            # Contenedor de desarrollo

# Docker Compose
npm run docker:compose:up         # Levantar servicios
npm run docker:compose:up:dev     # Levantar servicios de desarrollo
npm run docker:compose:down       # Detener servicios
npm run docker:compose:logs       # Ver logs
npm run docker:compose:build      # Construir imágenes
npm run docker:compose:restart    # Reiniciar servicios
```

### Comandos Docker Directos

```bash
# Construir imagen
docker build -t test-products .

# Ejecutar contenedor
docker run -p 3000:3000 --env-file .env test-products

# Ver logs
docker logs -f test-products-app

# Acceder al contenedor
docker exec -it test-products-app sh

# Limpiar recursos
docker-compose down -v
docker system prune -f
```

## 🏗️ Arquitectura de Servicios

### Servicios Incluidos

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| `postgres` | 5432 | Base de datos PostgreSQL |
| `app` | 3000 | Aplicación NestJS |
| `postgres-dev` | 5433 | Base de datos para desarrollo |

### Redes

- **app-network**: Red para servicios de producción
- **app-dev-network**: Red para servicios de desarrollo

### Volúmenes

- **postgres_data**: Datos persistentes de PostgreSQL
- **postgres_dev_data**: Datos de desarrollo

## 🔧 Configuración Avanzada

### Variables de Entorno Docker

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `NODE_ENV` | Entorno de ejecución | `production` |
| `PORT` | Puerto de la aplicación | `3000` |
| `DB_HOST` | Host de la base de datos | `postgres` |
| `DB_PORT` | Puerto de la base de datos | `5432` |
| `DB_USER` | Usuario de la base de datos | `postgres` |
| `DB_PASSWORD` | Contraseña de la base de datos | `postgres` |
| `DB_NAME` | Nombre de la base de datos | `test_products` |

### Health Checks

```yaml
# Aplicación
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/v1/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s

# Base de datos
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres -d test_products"]
  interval: 10s
  timeout: 5s
  retries: 5
```

## 🛠️ Desarrollo

### Hot Reload

Para desarrollo con recarga automática:

```bash
# Usar docker-compose.dev.yml
docker-compose -f docker-compose.dev.yml up -d

# El código se sincroniza automáticamente
# Los cambios se reflejan sin reiniciar el contenedor
```

### Debugging

```bash
# Acceder al contenedor
docker exec -it test-products-app sh

# Ver logs en tiempo real
docker-compose logs -f app

# Reiniciar solo la aplicación
docker-compose restart app
```

### Testing

```bash
# Ejecutar tests dentro del contenedor
docker exec -it test-products-app npm run test

# Ejecutar tests con cobertura
docker exec -it test-products-app npm run test:cov
```

## 🚀 Producción

### Optimizaciones

- **Multi-stage build**: Imagen optimizada para producción
- **Non-root user**: Ejecución segura con usuario `nestjs`
- **Health checks**: Monitoreo automático de salud
- **Resource limits**: Control de recursos del contenedor

### Despliegue

```bash
# Construir imagen de producción
docker build -t test-products:latest .

# Ejecutar en producción
docker run -d \
  --name test-products-prod \
  -p 3000:3000 \
  --env-file .env.production \
  test-products:latest
```

## 🔍 Troubleshooting

### Problemas Comunes

#### 1. Puerto ya en uso
```bash
# Verificar puertos ocupados
netstat -tulpn | grep :3000

# Cambiar puerto en docker-compose.yml
ports:
  - "3001:3000"
```

#### 2. Base de datos no conecta
```bash
# Verificar logs de PostgreSQL
docker-compose logs postgres

# Verificar conectividad
docker exec -it test-products-app ping postgres
```

#### 3. Variables de entorno faltantes
```bash
# Verificar variables cargadas
docker exec -it test-products-app env | grep DB_

# Recrear contenedores
docker-compose down
docker-compose up -d
```

#### 4. Problemas de permisos
```bash
# Limpiar volúmenes
docker-compose down -v
docker volume prune -f

# Recrear servicios
docker-compose up -d
```

### Logs Útiles

```bash
# Todos los servicios
docker-compose logs

# Solo aplicación
docker-compose logs app

# Solo base de datos
docker-compose logs postgres

# Seguir logs en tiempo real
docker-compose logs -f --tail=100
```

## 📊 Monitoreo

### Métricas de Contenedores

```bash
# Uso de recursos
docker stats

# Información detallada
docker inspect test-products-app

# Procesos en ejecución
docker exec -it test-products-app ps aux
```

### Health Checks

```bash
# Verificar salud de la aplicación
curl http://localhost:3000/api/v1/health

# Verificar salud de la base de datos
docker exec -it test-products-db pg_isready -U postgres
```

## 🔒 Seguridad

### Mejores Prácticas

1. **Variables de entorno**: Nunca hardcodear secretos
2. **Non-root user**: Ejecutar con usuario sin privilegios
3. **Imágenes base**: Usar imágenes oficiales y actualizadas
4. **Network isolation**: Usar redes Docker aisladas
5. **Resource limits**: Limitar uso de CPU y memoria

### Configuración de Seguridad

```yaml
# docker-compose.yml
services:
  app:
    user: "1001:1001"  # Non-root user
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /var/run
```

## 📚 Referencias

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Docker Guide](https://docs.nestjs.com/recipes/docker)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
