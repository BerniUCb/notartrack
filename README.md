# NotarTrack

**SaaS multi-tenant de gestión y seguimiento de trámites para notarías de fe pública en Bolivia.**

Muchas notarías pierden horas atendiendo llamadas de "¿ya está listo mi documento?". NotarTrack resuelve eso con dos caras:

- **Panel interno**: la secretaria o el notario registran un trámite y avanzan su estado con un botón. Cada trámite tiene un código de seguimiento único (ej. `NT-8F3K2`).
- **Página pública de seguimiento**: el cliente ingresa su código o su cédula y ve el estado de su trámite en un timeline estilo *tracking de courier*, sin necesidad de iniciar sesión.

Cuando el trámite queda **listo para recoger**, el cliente recibe automáticamente una **notificación por WhatsApp**.

---

## Características

**Panel interno (privado, por notaría)**
- Autenticación con email + contraseña (Auth.js + bcrypt) y dos roles: **Notario** y **Secretaria**.
- Alta de trámites con búsqueda/creación de cliente por CI y validación con Zod.
- Flujo de estados lineal (`Recibido → En elaboración → Para firma → Protocolizado → Listo para recoger → Entregado`) con historial auditado (quién y cuándo).
- El **Notario** puede retroceder estados con comentario obligatorio; la Secretaria no.
- Gestión de usuarios de la propia notaría (solo Notario).

**Página pública de seguimiento**
- Búsqueda por código o por cédula (con selección de notaría).
- Timeline visual: pasos completados, actual y pendientes, con fecha y hora.
- Datos sensibles protegidos: CI enmascarado, sin observaciones internas.
- Rate limiting por IP para evitar scraping y `noindex` en las vistas de trámite.

**Notificaciones**
- Envío automático por WhatsApp al pasar a *Listo para recoger* (WhatsApp Cloud API de Meta).
- El envío está **aislado** en un solo módulo para poder cambiar de proveedor sin tocar el resto.
- No bloquea ni rompe el cambio de estado: cada intento queda registrado (`ENVIADO` / `FALLIDO` + error).
- *Feature flag* de WhatsApp por notaría.

**Multi-tenancy**
- Toda query del panel filtra por la notaría del usuario en sesión. Un trámite de otra notaría no es accesible ni por URL directa (devuelve 404).

---

## Stack

- **Next.js 15** (App Router, Server Actions, TypeScript estricto)
- **PostgreSQL** (Neon) + **Drizzle ORM**
- **Auth.js** (NextAuth v5) con proveedor de credenciales + **bcrypt**
- **Tailwind CSS** + **shadcn/ui**
- **WhatsApp Cloud API** (Meta)
- Deploy en **Vercel**

---

## Estructura

```
/app
  /(public)/seguimiento   → página pública de tracking
  /(panel)/panel          → dashboard interno (protegido)
  /login                  → ingreso
  /api/auth               → handler de Auth.js
/actions                  → Server Actions (mutaciones)
/lib                      → lógica de negocio, db, utils
/db                       → schema de Drizzle, migraciones y seed
/components               → UI compartida
```

---

## Cómo correrlo localmente

**Requisitos:** Node.js 20+ y una base PostgreSQL (recomendado: [Neon](https://neon.tech), gratis).

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# completar DATABASE_URL, AUTH_SECRET y (opcional) las variables de WhatsApp

# 3. Crear las tablas y cargar datos de prueba
npm run db:migrate
npm run db:seed

# 4. Levantar el proyecto
npm run dev
```

Abrí [http://localhost:3000/seguimiento](http://localhost:3000/seguimiento) (público) o [http://localhost:3000/panel](http://localhost:3000/panel) (panel).

**Usuarios de prueba** (contraseña `notaria123`):

| Notaría | Notario | Secretaria |
|---|---|---|
| N° 42 — Cochabamba | `notario@notaria42.bo` | `secretaria@notaria42.bo` |
| N° 7 — La Paz | `notario@notaria7.bo` | `secretaria@notaria7.bo` |

---

## Desarrollo por fases

- [x] **Fase 0** — Setup (Next.js, Tailwind, shadcn/ui, Drizzle)
- [x] **Fase 1** — Modelo de datos + CRUD interno
- [x] **Fase 2** — Página pública de seguimiento
- [x] **Fase 3** — Autenticación, multi-tenancy y roles
- [x] **Fase 4** — Notificaciones por WhatsApp
- [ ] **Fase 5** — Pulido para demo

---

Proyecto de portafolio. Datos de ejemplo (nombres, cédulas, celulares) son ficticios.
