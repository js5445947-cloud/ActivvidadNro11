# 📋 Task Manager - Sistema de Gestión de Tareas

> Aplicación web full-stack para la gestión eficiente de tareas personales con autenticación segura y seguimiento de progreso.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.2.0-blue)](https://reactjs.org/)

## 🎯 Propósito del Sistema

Task Manager es una solución de gestión de tareas diseñada para ayudar a usuarios individuales a organizar su trabajo diario de manera efectiva. El sistema permite crear, editar, completar y eliminar tareas con características como:

- 🔐 Autenticación segura con JWT
- ✅ Gestión completa de tareas (CRUD)
- 📅 Fechas límite y priorización
- 📊 Seguimiento de progreso
- 🎨 Interfaz intuitiva y responsive

---

## 🏗️ Arquitectura Tecnológica

### Stack Principal

**Backend:**
- **Runtime:** Node.js v18+
- **Framework:** Express.js 4.18
- **Base de Datos:** PostgreSQL 15
- **ORM:** Prisma 5.x
- **Autenticación:** JWT (jsonwebtoken)
- **Seguridad:** bcrypt para hashing de contraseñas
- **Validación:** express-validator
- **Testing:** Jest + Supertest

**Frontend:**
- **Framework:** React 18.2 con Vite 4.x
- **Estilos:** Tailwind CSS 3.x
- **Estado:** React Query (TanStack Query)
- **Routing:** React Router DOM v6
- **HTTP Client:** Axios
- **Testing:** React Testing Library + Jest

**DevOps:**
- **Control de Versiones:** Git + GitHub
- **CI/CD:** GitHub Actions
- **Linting:** ESLint + Prettier
- **Deployment:** Vercel (Frontend) + Railway (Backend)

### Arquitectura de Capas
```
┌─────────────────────────────────────┐
│         Frontend (React)            │
│  ┌──────────────────────────────┐   │
│  │  Components / Pages / Hooks  │   │
│  └──────────────────────────────┘   │
└─────────────────┬───────────────────┘
                  │ HTTP/REST
┌─────────────────▼───────────────────┐
│      Backend API (Express)          │
│  ┌──────────────────────────────┐   │
│  │   Routes → Controllers       │   │
│  │   Middlewares (Auth, Valid)  │   │
│  │   Services (Business Logic)  │   │
│  └──────────────────────────────┘   │
└─────────────────┬───────────────────┘
                  │ Prisma ORM
┌─────────────────▼───────────────────┐
│       PostgreSQL Database           │
│  ┌──────────────────────────────┐   │
│  │  Tables: users, tasks, logs  │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 🚀 Guía de Instalación Rápida

### Prerrequisitos

- Node.js 18+ ([Descargar](https://nodejs.org/))
- PostgreSQL 15+ ([Descargar](https://www.postgresql.org/download/))
- npm o yarn
- Git

### 1. Clonar el Repositorio
```bash
git clone https://github.com/js5445947-cloud/ActivvidadNro11.git
cd ActivvidadNro11
```

### 2. Configurar Backend
```bash
# Navegar a la carpeta del backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Editar .env con tus credenciales:
# DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/taskmanager"
# JWT_SECRET="tu-secreto-super-seguro"
# JWT_EXPIRES_IN="1h"
# REFRESH_TOKEN_EXPIRES_IN="30d"

# Ejecutar migraciones de base de datos
npx prisma migrate dev

# Generar Prisma Client
npx prisma generate

# Iniciar servidor de desarrollo
npm run dev
```

El backend estará corriendo en `http://localhost:3000`

### 3. Configurar Frontend
```bash
# Abrir nueva terminal
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Editar .env:
# VITE_API_URL=http://localhost:3000/api

# Iniciar aplicación
npm run dev
```

El frontend estará corriendo en `http://localhost:5173`

### 4. Verificar Instalación

1. Abre tu navegador en `http://localhost:5173`
2. Deberías ver la página de login/registro
3. Crea una cuenta de prueba
4. Inicia sesión y crea tu primera tarea

---

## 📦 Módulos Principales

### Backend - Estructura de Carpetas
```
backend/
├── src/
│   ├── controllers/          # Controladores de rutas
│   │   ├── authController.js     # Registro y login
│   │   └── taskController.js     # CRUD de tareas
│   ├── middlewares/          # Middlewares personalizados
│   │   ├── authMiddleware.js     # Verificación JWT
│   │   └── errorHandler.js       # Manejo global de errores
│   ├── routes/               # Definición de rutas
│   │   ├── authRoutes.js
│   │   └── taskRoutes.js
│   ├── services/             # Lógica de negocio
│   │   ├── authService.js
│   │   └── taskService.js
│   ├── utils/                # Utilidades
│   │   └── validators.js
│   └── app.js                # Configuración de Express
├── prisma/
│   └── schema.prisma         # Esquema de base de datos
├── tests/                    # Tests automatizados
└── package.json
```

#### Módulo de Autenticación (`authController.js`)
- **Responsabilidad:** Manejo de registro e inicio de sesión
- **Endpoints:**
  - `POST /api/auth/register` - Registro de nuevo usuario
  - `POST /api/auth/login` - Inicio de sesión
  - `POST /api/auth/refresh` - Renovar token
- **Seguridad:** Hash bcrypt (salt rounds: 10), validación de email único

#### Módulo de Tareas (`taskController.js`)
- **Responsabilidad:** Gestión completa de tareas
- **Endpoints:**
  - `GET /api/tasks` - Listar tareas del usuario
  - `POST /api/tasks` - Crear nueva tarea
  - `PUT /api/tasks/:id` - Editar tarea
  - `PATCH /api/tasks/:id/complete` - Marcar como completada
  - `DELETE /api/tasks/:id` - Eliminar tarea (soft delete)
- **Validaciones:** Ownership verification, input sanitization

### Frontend - Estructura de Componentes
```
frontend/
├── src/
│   ├── components/           # Componentes reutilizables
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   ├── tasks/
│   │   │   ├── TaskList.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   └── TaskFilters.jsx
│   │   └── common/
│   │       ├── Navbar.jsx
│   │       └── LoadingSpinner.jsx
│   ├── pages/                # Páginas principales
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Dashboard.jsx
│   ├── hooks/                # Custom hooks
│   │   ├── useAuth.js
│   │   └── useTasks.js
│   ├── context/              # Context API
│   │   └── AuthContext.jsx
│   ├── services/             # API calls
│   │   └── api.js
│   └── App.jsx
└── package.json
```

#### Componente Principal (`Dashboard.jsx`)
- **Funcionalidad:** Vista principal con lista de tareas
- **Features:** Filtrado por estado, búsqueda, ordenamiento

#### Context de Autenticación (`AuthContext.jsx`)
- **Responsabilidad:** Estado global de autenticación
- **Funciones:** login(), logout(), checkAuth()
- **Persistencia:** Token en localStorage

---

## 🗄️ Modelo de Datos

### Esquema Prisma
```prisma
model User {
  id            String   @id @default(uuid())
  name          String
  email         String   @unique
  password_hash String
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
  tasks         Task[]
}

model Task {
  id          String    @id @default(uuid())
  title       String
  description String?
  due_date    DateTime?
  priority    Priority  @default(MEDIUM)
  status      Status    @default(PENDING)
  completed_at DateTime?
  deleted_at  DateTime?
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt
  user_id     String
  user        User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

enum Status {
  PENDING
  IN_PROGRESS
  COMPLETED
}
```

---

## 🧪 Testing

### Ejecutar Tests Backend
```bash
cd backend
npm test                    # Ejecutar todos los tests
npm test -- --coverage      # Con reporte de cobertura
npm test -- --watch         # Modo watch
```

**Cobertura Mínima Requerida:** 80%

### Ejecutar Tests Frontend
```bash
cd frontend
npm test                    # Ejecutar tests
npm test -- --coverage      # Con cobertura
```

---

## 🔒 Seguridad

### Medidas Implementadas

- ✅ Hashing de contraseñas con bcrypt (salt rounds: 10)
- ✅ JWT para autenticación stateless
- ✅ Validación de inputs en backend y frontend
- ✅ Protección contra SQL Injection (Prisma ORM)
- ✅ Rate limiting en endpoints de autenticación
- ✅ CORS configurado apropiadamente
- ✅ Variables sensibles en `.env` (no commiteadas)
- ✅ Sanitización de inputs contra XSS

---

## 📊 Gobernanza del Proyecto

Para información sobre estándares de desarrollo, Definition of Ready (DoR) y Definition of Done (DoD), consulta:

📄 **[GOVERNANCE.md](./GOVERNANCE.md)**

Para decisiones de arquitectura, consulta:

📁 **[/docs/adr/](./docs/adr/)** - Architecture Decision Records

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feat/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feat/nueva-funcionalidad`)
5. Abre un Pull Request

**Convención de Commits:** Seguimos [Conventional Commits](https://www.conventionalcommits.org/)
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Cambios en documentación
- `test:` - Agregar o modificar tests
- `refactor:` - Refactorización de código

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo [LICENSE](LICENSE) para más detalles.

---

## 👥 Equipo de Desarrollo

- **Desarrollador Principal:** js5445947-cloud
- **Proyecto Académico:** Ingeniería de Software
- **Institución:** [Tu Institución]
- **Año:** 2026

---

## 📮 Contacto y Soporte

Para reportar bugs o sugerir mejoras, por favor abre un [Issue](https://github.com/js5445947-cloud/ActivvidadNro11/issues).

---

**Última actualización:** Enero 2026  
**Versión:** 1.0.0
