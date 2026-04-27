<div align="center">

<img src="src/assets/readmeimg.png" alt="Mediconnect Landing Page" width="100%" style="border-radius: 24px;" />

# Mediconnect

**Conectando el Futuro de la Atención Médica**

Una plataforma integral que transforma la comunicación entre médicos, pacientes y centros de salud.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=flat-square&logo=vite)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Private-red?style=flat-square)]()

🌐 **[mediconnectrd.com](https://www.mediconnectrd.com)**

</div>

---

## 📋 Tabla de Contenidos

- [Sobre el Proyecto](#-sobre-el-proyecto)
- [Características Principales](#-características-principales)
- [Tech Stack](#-tech-stack)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Scripts Disponibles](#-scripts-disponibles)
- [Variables de Entorno](#-variables-de-entorno)
- [Módulos de la Plataforma](#-módulos-de-la-plataforma)
- [Servicios Externos](#-servicios-externos)

---

## 🏥 Sobre el Proyecto

**Mediconnect** es una plataforma healthcare SaaS diseñada para digitalizar y optimizar la atención médica en la República Dominicana y Latinoamérica. Conecta en un solo ecosistema a **pacientes**, **médicos** y **centros de salud**, ofreciendo desde agendamiento de citas hasta teleconsulta con video en tiempo real.

La plataforma fue construida con una arquitectura **SPA (Single Page Application)** moderna, centrada en la experiencia del usuario, la accesibilidad y el rendimiento.

---

## ✨ Características Principales

| Módulo                           | Descripción                                                                            |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| 🔐 **Autenticación**             | Login, registro y recuperación de contraseña con soporte OAuth (Google)                |
| 🧭 **Onboarding Multi-rol**      | Flujos de registro diferenciados para Pacientes, Médicos y Centros Médicos             |
| 📅 **Gestión de Citas**          | Agendamiento, reprogramación y cancelación de citas médicas                            |
| 🗺️ **Búsqueda de Proveedores**   | Motor de búsqueda con mapa interactivo (Mapbox GL), filtros por especialidad y seguros |
| 🔍 **Comparador de Proveedores** | Compara médicos y centros lado a lado                                                  |
| 💬 **Chat en Tiempo Real**       | Mensajería persistente médico-paciente via WebSockets                                  |
| 📹 **Teleconsulta**              | Consultas por video con Daily.co, chat integrado y prescripciones digitales            |
| 📊 **Dashboard de Analytics**    | Métricas y estadísticas para médicos y centros de salud                                |
| 🤝 **Sistema de Alianzas**       | Solicitudes de alianza y verificación profesional                                      |
| 🌐 **Internacionalización**      | Soporte multi-idioma con i18next                                                       |
| 🌙 **Tema Oscuro/Claro**         | Soporte completo de temas con next-themes                                              |

---

## 🛠 Tech Stack

### Frontend Core

- **[React 19](https://react.dev/)** — UI library con las últimas features (concurrent rendering, compiler-ready)
- **[TypeScript 5.9](https://www.typescriptlang.org/)** — Tipado estático para mayor seguridad y mantenibilidad
- **[Vite 7](https://vite.dev/)** — Build tool ultrarrápido con HMR
- **[React Router DOM v7](https://reactrouter.com/)** — Enrutamiento del lado del cliente

### UI & Estilos

- **[Tailwind CSS 4](https://tailwindcss.com/)** — Utilidades CSS con diseño adaptativo
- **[Radix UI](https://www.radix-ui.com/)** — Componentes accesibles sin estilo (Dialog, Select, Tabs, etc.)
- **[Framer Motion](https://www.framer.com/motion/)** — Animaciones declarativas
- **[GSAP](https://gsap.com/)** — Animaciones avanzadas de alto rendimiento
- **[Lucide React](https://lucide.dev/)** — Iconografía consistente

### Estado & Datos

- **[Zustand 5](https://zustand-demo.pmnd.rs/)** — Estado global ligero y modular
- **[TanStack Query v5](https://tanstack.com/query)** — Server state, caché y sincronización
- **[React Hook Form](https://react-hook-form.com/)** + **[Zod](https://zod.dev/)** — Formularios con validación tipada
- **[Axios](https://axios-http.com/)** — Cliente HTTP con interceptors

### Real-time & Media

- **[Socket.IO Client](https://socket.io/)** — Mensajería y eventos en tiempo real
- **[Daily.co](https://www.daily.co/)** — Infraestructura de video para teleconsultas
- **[Cloudinary](https://cloudinary.com/)** — Gestión y optimización de imágenes
- **[Mapbox GL](https://www.mapbox.com/)** + **[react-map-gl](https://visgl.github.io/react-map-gl/)** — Mapas interactivos

### Herramientas de Desarrollo

- **[TanStack Query DevTools](https://tanstack.com/query/latest/docs/framework/react/devtools)** — Debug de queries
- **[ESLint](https://eslint.org/)** + **[typescript-eslint](https://typescript-eslint.io/)** — Linting estricto
- **[@vercel/analytics](https://vercel.com/analytics)** — Analytics de producción

---

## 🏗 Arquitectura del Sistema

```
┌─────────────────────────────────────────────┐
│              Client Layer (React 19)         │
│  src/main.tsx → App.tsx → AppRouter.tsx      │
│         └── DashboardLayout.tsx              │
├──────────────┬──────────────────────────────┤
│  State Layer │        Data Layer             │
│   Zustand    │     TanStack Query            │
│  useAppStore │   (server state + cache)      │
├──────────────┴──────────────────────────────┤
│              External Services               │
│  Daily.co │ Cloudinary │ Mapbox │ Socket.IO  │
└─────────────────────────────────────────────┘
```

### Flujo de Rutas (RBAC)

La plataforma implementa **Control de Acceso Basado en Roles**:

```
/ (público)
├── /login
├── /register
├── /onboarding
│   ├── /patient
│   ├── /doctor
│   └── /center
├── /dashboard/patient/*   → rol: PATIENT
├── /dashboard/doctor/*    → rol: DOCTOR
├── /dashboard/center/*    → rol: CENTER
├── /search                → compartido
├── /chat                  → compartido
└── /teleconsult/:id       → compartido
```

---

## 📁 Estructura del Proyecto

```
mediconnect-main/
├── public/
├── src/
│   ├── assets/               # Imágenes y recursos estáticos
│   ├── features/             # Módulos por dominio
│   │   ├── patient/          # Dashboard, perfil, citas del paciente
│   │   ├── doctor/           # Servicios, agenda, analytics del médico
│   │   ├── center/           # Perfil, staff, dashboard del centro
│   │   ├── search/           # Búsqueda de proveedores con mapa
│   │   ├── teleconsult/      # Video llamada + prescripción
│   │   ├── chat/             # Mensajería en tiempo real
│   │   ├── onboarding/       # Flujos de registro multi-paso
│   │   └── auth/             # Login, register, recovery
│   ├── shared/               # Componentes compartidos (MC-prefixed)
│   │   ├── navigation/       # MCUserMenu, Navbar
│   │   ├── ui/               # MCButton, MCModal, MCTable, etc.
│   │   └── layout/           # DashboardShell
│   ├── stores/               # Zustand: useAppStore + slices
│   ├── services/             # Axios client + SocketService
│   ├── hooks/                # Custom hooks + React Query hooks
│   ├── router/               # AppRouter + routes.ts
│   ├── i18n/                 # Configuración y namespaces
│   └── utils/                # Helpers, Cloudinary, etc.
├── package.json
├── tsconfig.app.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js** >= 20.x
- **npm** >= 10.x (o pnpm / yarn)

### Clonar e Instalar

```bash
# Clonar el repositorio
git clone https://github.com/EmmanuelRoa/Mediconnect-Main.git
cd Mediconnect-Main

# Instalar dependencias
npm install
```

### Configurar Variables de Entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales (ver sección de Variables de Entorno)
```

### Ejecutar en Desarrollo

```bash
npm run dev
```

La app estará disponible en `http://localhost:5173`.

---

## 📜 Scripts Disponibles

| Comando           | Descripción                                         |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo con HMR                      |
| `npm run build`   | Build de producción (TypeScript check + Vite build) |
| `npm run preview` | Preview del build de producción localmente          |
| `npm run lint`    | Análisis estático de código con ESLint              |

---

## 🔑 Variables de Entorno

```env
# API Backend
VITE_API_BASE_URL=https://api.mediconnectrd.com

# Mapbox (mapas interactivos)
VITE_MAPBOX_ACCESS_TOKEN=pk.xxx...

# Cloudinary (gestión de imágenes)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name

# Daily.co (teleconsultas por video)
VITE_DAILY_DOMAIN=your-domain.daily.co

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Socket.IO
VITE_SOCKET_URL=https://socket.mediconnectrd.com
```

---

## 📦 Módulos de la Plataforma

### 👤 Módulo Paciente

- Dashboard con próximas citas y resumen médico
- Gestión de perfil y historial médico
- Agendamiento y cancelación de citas
- "Mis Médicos" — directorio de profesionales vinculados
- Búsqueda y comparación de proveedores por mapa

### 🩺 Módulo Médico

- Dashboard con métricas y analytics (Recharts)
- Gestión de servicios y tarifas
- Agenda de citas y gestión de pacientes
- Editor de perfil profesional con verificación
- Sistema de alianzas con centros médicos

### 🏥 Módulo Centro Médico

- Perfil institucional editable
- Gestión de staff y personal médico
- Dashboard con estadísticas del centro
- Solicitudes de alianza con médicos

### 📹 Teleconsulta

- Sala de video con Daily.co (multi-participante)
- Chat integrado durante la consulta
- Generación de recetas/prescripciones digitales

### 💬 Chat

- Mensajería persistente en tiempo real via Socket.IO
- Historial de conversaciones médico-paciente
- Event Bus para comunicación entre componentes

---

## 🌐 Servicios Externos

| Servicio                                               | Uso                                             |
| ------------------------------------------------------ | ----------------------------------------------- |
| [Daily.co](https://daily.co)                           | Video rooms para teleconsultas                  |
| [Mapbox GL](https://mapbox.com)                        | Mapas interactivos para búsqueda de proveedores |
| [Cloudinary](https://cloudinary.com)                   | Almacenamiento y optimización de imágenes       |
| [Socket.IO](https://socket.io)                         | Chat y eventos en tiempo real                   |
| [Google OAuth](https://developers.google.com/identity) | Autenticación social                            |
| [Vercel Analytics](https://vercel.com/analytics)       | Métricas de producción                          |

---

<div align="center">

Hecho con ❤️ por el equipo de **Mediconnect** · República Dominicana 🇩🇴

[🌐 mediconnectrd.com](https://www.mediconnectrd.com) · [📚 Documentación Técnica](https://deepwiki.com/EmmanuelRoa/Mediconnect-Main)

</div>
