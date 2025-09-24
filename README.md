# Test Products API

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.x-red.svg)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue.svg)](https://postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://typescriptlang.org/)
[![Coverage](https://img.shields.io/badge/Coverage-80%25-brightgreen.svg)](./coverage)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Passing-brightgreen.svg)](https://github.com/jmBustaf/Test-apply-digital/actions)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **API REST para gestión de productos con sincronización automática desde Contentful, módulos público y privado, autenticación JWT y reportes avanzados.**

## Tabla de Contenidos

- [ Descripción del Proyecto](#-descripción-del-proyecto)
- [ Stack Tecnológico](#️-stack-tecnológico)
- [ Funcionalidades Implementadas](#-funcionalidades-implementadas)
- [ Instalación y Configuración](#-instalación-y-configuración)
- [ Documentación de API](#-documentación-de-api)
- [ Testing y Cobertura](#-testing-y-cobertura)
- [ Scripts Disponibles](#-scripts-disponibles)
- [ Estructura del Proyecto](#-estructura-del-proyecto)
- [ Variables de Entorno](#-variables-de-entorno)
- [ Reportes y Métricas](#-reportes-y-métricas)
- [ Contribución](#-contribución)
- [ Contacto](#-contacto)

##  Descripción del Proyecto

**Test Products API** es una solución backend robusta que implementa un sistema completo de gestión de productos con las siguientes características principales:

###  **Sincronización Automática**
- **Sincronización cada hora** con Contentful API
- **Actualización automática** de datos de productos
- **Manejo inteligente** de conflictos y duplicados
- **Soft delete** para productos eliminados en Contentful

### 🌐 **Módulos de API**

#### **Módulo Público** (Sin autenticación)
- Búsqueda paginada de productos (máximo 5 items por página)
- Filtros avanzados por nombre, categoría y rango de precios
- **Análisis de stock bajo** con validación de categorías
- Endpoints RESTful optimizados para clientes externos

#### **Módulo Privado** (Con autenticación JWT)
- **Reportes de métricas** avanzados
- **Porcentaje de productos eliminados**
- **Análisis de productos activos** con filtros personalizados
- **Gestión de usuarios** y autenticación segura

##  Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 20.x LTS | Runtime de JavaScript |
| **NestJS** | 11.x | Framework de backend |
| **TypeScript** | 5.x | Lenguaje de programación |
| **PostgreSQL** | 15.x | Base de datos principal |
| **TypeORM** | 0.3.x | ORM para base de datos |
| **Swagger** | 11.x | Documentación de API |
| **JWT** | 9.x | Autenticación |
| **Contentful** | 11.x | CMS externo |
| **Jest** | 30.x | Framework de testing |
| **ESLint** | 9.x | Linting de código |
| **Prettier** | 3.x | Formateo de código |

##  Funcionalidades Implementadas

###  **Requisitos Principales**
- [x] **Sincronización automática** cada hora con Contentful
- [x] **API REST** con paginación (máx 5 items por página)
- [x] **Filtros avanzados** por nombre, categoría y precio
- [x] **Soft delete** persistente (no reaparecen al reiniciar)
- [x] **Módulos público y privado** separados
- [x] **Autenticación JWT** para módulo privado
- [x] **Reportes de métricas** avanzados

###  **Requisitos Técnicos**
- [x] **Node.js LTS** + NestJS
- [x] **PostgreSQL** + TypeORM
- [x] **Swagger** en `/api/v1/docs`
- [x] **Testing** con >30% cobertura
- [x] **GitHub Actions** para CI/CD
- [x] **Conventional Commits** + GitFlow
- [x] **Docker** (próximamente)

### 📊 **Métricas de Calidad**
- **82 tests unitarios** pasando 
- **2 tests de integración** pasando 
- **Cobertura de código >80%** 
- **Linting y formato** automático 
- **Pipeline CI/CD** funcionando 

##  Instalación y Configuración

### **Prerrequisitos**
- Node.js 20.x LTS
- PostgreSQL 15.x
- npm

### **1. Clonar el Repositorio**
```bash
git clone https://github.com/jmBustaf/Test-apply-digital.git
cd Test-apply-digital
```

### **2. Instalar Dependencias**
```bash
npm install
```

### **3. Configurar Variables de Entorno**
Crear archivo `.env` en la raíz del proyecto:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=test_products

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m

# Contentful
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_DELIVERY_TOKEN=your_delivery_token
CONTENTFUL_CONTENT_TYPE=product

# Sincronización
SYNC_JOB_NAME=contentful-hourly-sync
SYNC_INTERVAL_MS=3600000

# Seguridad
BCRYPT_SALT_ROUNDS=10

# Aplicación
NODE_ENV=development
PORT=3000
```

### **4. Configurar Base de Datos**
```bash
# Crear base de datos PostgreSQL
createdb test_products

# Las migraciones se ejecutan automáticamente en desarrollo
```

### **5. Ejecutar la Aplicación**
```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

### **6. Acceder a la Documentación**
- **Swagger UI**: http://localhost:3000/api/v1/docs
- **API Base**: http://localhost:3000/api/v1

##  Documentación de API

### ** Módulo Público** (Sin autenticación)

#### **Búsqueda de Productos**
```http
GET /api/v1/products/search?name=iphone&page=1
```

#### **Filtro por Categoría**
```http
GET /api/v1/products/category?category=electronics&page=1
```

#### **Filtro por Rango de Precios**
```http
GET /api/v1/products/price-range?minPrice=100&maxPrice=500&page=1
```

#### **Productos con Stock Bajo** ⚠️
```http
GET /api/v1/products/low-stock?category=Smartphone&threshold=10&page=1&limit=5
```

**Parámetros:**
- `category` (opcional): Categoría a buscar (ej: "Smartphone", "Laptop")
- `threshold` (opcional): Umbral de stock, por defecto 5
- `page` (opcional): Página, por defecto 1
- `limit` (opcional): Elementos por página, por defecto 10

**Características:**
- ✅ **Validación de categoría**: Verifica si la categoría existe
- ✅ **Respuesta simplificada**: Solo muestra nombre y stock
- ✅ **Mensaje descriptivo**: Explica la situación del stock
- ✅ **Búsqueda inteligente**: Si no hay categoría, busca en todas

### ** Módulo Privado** (Con JWT)

#### **Autenticación**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "userName": "usuario",
  "password": "contraseña"
}
```

#### **Reportes de Métricas**

**1. Porcentaje de Productos Eliminados**
```http
GET /api/v1/products/percent-deleted
Authorization: Bearer <jwt_token>
```

**2. Porcentaje de Productos Activos**
```http
GET /api/v1/products/percent-active?hasPrice=with&dateField=created&from=2024-01-01&to=2024-12-31
Authorization: Bearer <jwt_token>
```

**3. Eliminar Producto (Soft Delete)**
```http
DELETE /api/v1/products/sku/PRODUCT-SKU-123
Authorization: Bearer <jwt_token>
```

### ** Ejemplos de Respuesta**

#### **Búsqueda Exitosa**
```json
{
  "statusCode": 200,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": "uuid-123",
      "name": "iPhone 15",
      "category": "electronics",
      "price": "999.00",
      "currency": "USD",
      "stock": 10,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 5,
    "totalItems": 25,
    "totalPages": 5
  }
}
```

#### **Productos con Stock Bajo** ⚠️
```json
{
  "statusCode": 200,
  "message": "Para la categoría 'Smartphone', estos productos están próximos a agotarse (stock ≤ 10).",
  "data": [
    {
      "name": "Samsung Galaxy A14",
      "stock": 3
    },
    {
      "name": "iPhone 13 Pro",
      "stock": 7
    },
    {
      "name": "OnePlus 9",
      "stock": 2
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 15,
    "totalPages": 2
  }
}
```

#### **Categoría No Encontrada**
```json
{
  "statusCode": 200,
  "message": "No existen productos para la categoría 'NoExiste'",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

#### **Autenticación Exitosa**
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "logged": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "15m"
  }
}
```

##  Testing y Cobertura

### **Ejecutar Tests**
```bash
# Todos los tests
npm run test:all

# Tests unitarios
npm run test:unit

# Tests de integración
npm run test:integration

# Tests E2E
npm run test:e2e

# Con cobertura
npm run test:cov
```

### **Cobertura de Código**
- **Statements**: 80%+
- **Branches**: 80%+
- **Functions**: 80%+
- **Lines**: 80%+

### **Reportes de Cobertura**
Los reportes HTML se generan en:
- `./coverage/unit/` - Tests unitarios
- `./coverage/integration/` - Tests de integración
- `./coverage/e2e/` - Tests E2E

##  Scripts Disponibles

```bash
# Desarrollo
npm run start:dev          # Modo desarrollo con hot reload
npm run start:debug        # Modo debug

# Producción
npm run build              # Compilar TypeScript
npm run start:prod         # Ejecutar en producción

# Testing
npm run test               # Tests unitarios
npm run test:unit          # Tests unitarios específicos
npm run test:integration   # Tests de integración
npm run test:e2e           # Tests end-to-end
npm run test:all           # Todos los tests
npm run test:cov           # Tests con cobertura

# Calidad de Código
npm run lint               # ESLint
npm run format             # Prettier
npm run lint:file          # Lint archivo específico
```

##  Estructura del Proyecto

```
test-products/
├── 📁 src/
│   ├── 📁 auth/                    # Módulo de autenticación
│   │   ├── auth.controller.ts      # Controlador de login
│   │   ├── auth.service.ts         # Lógica de autenticación
│   │   └── dto/                    # DTOs de validación
│   ├── 📁 products/                # Módulo de productos
│   │   ├── products.controller.ts  # Controlador público/privado
│   │   ├── products.service.ts     # Lógica de negocio
│   │   ├── entities/               # Entidades de base de datos
│   │   └── dto/                    # DTOs de validación
│   ├── 📁 users/                   # Módulo de usuarios
│   │   ├── users.controller.ts     # Controlador público/privado
│   │   ├── users.service.ts        # Lógica de negocio
│   │   ├── entities/               # Entidades de base de datos
│   ├── 📁 integrations/            # Integraciones externas
│   │   ├── contentful/             # Sincronización con Contentful
│   │   └── schedule/               # Tareas programadas
│   ├── 📁 common/                  # Utilidades comunes
│   ├── 📁 test-utils/              # Utilidades de testing
│   └── 📁 __tests__/               # Tests organizados
├── 📁 config/                      # Configuración de la app
├── 📁 .github/workflows/           # GitHub Actions
├── 📁 coverage/                    # Reportes de cobertura
├── 📄 docker-compose.yml           # Orquestación de servicios
├── 📄 Dockerfile                   # Imagen de la aplicación
└── 📄 README.md                    # Este archivo
```

## 🔐 Variables de Entorno

| Variable | Descripción | Requerido | Ejemplo |
|----------|-------------|-----------|---------|
| `DB_HOST` | Host de PostgreSQL | ✅ | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | ✅ | `5432` |
| `DB_USER` | Usuario de PostgreSQL | ✅ | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | ✅ | `password123` |
| `DB_NAME` | Nombre de la base de datos | ✅ | `test_products` |
| `JWT_SECRET` | Clave secreta para JWT | ✅ | `super-secret-key` |
| `JWT_EXPIRES_IN` | Tiempo de expiración JWT | ❌ | `15m` |
| `CONTENTFUL_SPACE_ID` | ID del espacio Contentful | ✅ | `abc123def456` |
| `CONTENTFUL_DELIVERY_TOKEN` | Token de Contentful | ✅ | `CFPAT-...` |
| `CONTENTFUL_CONTENT_TYPE` | Tipo de contenido | ✅ | `product` |
| `SYNC_INTERVAL_MS` | Intervalo de sincronización | ❌ | `3600000` |
| `BCRYPT_SALT_ROUNDS` | Rounds de encriptación | ❌ | `10` |
| `NODE_ENV` | Entorno de ejecución | ❌ | `development` |
| `PORT` | Puerto de la aplicación | ❌ | `3000` |

##  Reportes y Métricas

### **1. Porcentaje de Productos Eliminados**
Calcula el porcentaje de productos que han sido eliminados (soft delete) del total de productos.

### **2. Porcentaje de Productos Activos**
Análisis avanzado de productos activos con filtros:
- **Con/Sin precio**: Filtra productos que tienen o no tienen precio
- **Rango de fechas**: Filtra por fecha de creación o actualización
- **Conteos detallados**: Muestra números exactos de activos vs totales

### **3. Análisis de Stock Bajo** ⚠️
- **Validación inteligente**: Verifica existencia de categorías
- **Respuesta optimizada**: Solo datos esenciales (nombre y stock)
- **Mensajes descriptivos**: Explica la situación del inventario
- **Búsqueda flexible**: Por categoría específica o todas las categorías
- **Umbral configurable**: Define qué se considera "stock bajo"

### **4. Reportes Personalizados**
- **Tendencias de precios**: Análisis de rangos de precios
- **Categorías más populares**: Estadísticas por categoría
- **Alertas de inventario**: Notificaciones automáticas de stock bajo

##  Contribución

### **GitFlow**
El proyecto utiliza GitFlow para el control de versiones:

```bash
# Crear feature branch
git checkout -b feature/nueva-funcionalidad

# Hacer commit con formato estándar
git commit -m "feat: agregar nueva funcionalidad"

# Merge a develop
git checkout develop
git merge feature/nueva-funcionalidad
```

### **Conventional Commits**
Utilizamos Conventional Commits para mensajes consistentes:

- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Cambios en documentación
- `style:` - Cambios de formato
- `refactor:` - Refactorización
- `test:` - Agregar o corregir tests
- `chore:` - Cambios en herramientas

### **Testing**
- Todos los cambios deben incluir tests
- Cobertura mínima del 80%
- Tests deben pasar en GitHub Actions

##  Contacto

**Desarrollador**: [Jose Miguel Bustamante Franco]
**Email**: [josemiguelbf8@gmail.com]
**GitHub**: [@jmBustaf](https://github.com/jmBustaf)
**LinkedIn**: (https://www.linkedin.com/in/jose-miguel-bustamante-franco-067822204/)

---

##  **Resumen de Cumplimiento**

###  **Requisitos Técnicos Completados**
- [x] Node.js LTS + NestJS
- [x] PostgreSQL + TypeORM
- [x] Swagger en `/api/v1/docs`
- [x] Testing >30% cobertura
- [x] GitHub Actions CI/CD
- [x] Conventional Commits + GitFlow

###  **Funcionalidades Implementadas**
- [x] Sincronización automática cada hora
- [x] API pública paginada (máx 5 items)
- [x] Filtros por nombre, categoría, precio
- [x] Soft delete persistente
- [x] Módulos público y privado
- [x] Autenticación JWT
- [x] Reportes de métricas avanzados

###  **Próximos Pasos**
- [ ] Dockerización completa
- [ ] Docker Compose para desarrollo
- [ ] Despliegue en producción
- [ ] Monitoreo y logging avanzado

---

**¡Gracias por revisar mi implementación!** 🎉
