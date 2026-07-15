# NotarTrack — Sistema de gestión y seguimiento de trámites para notarías

## Qué es este proyecto
SaaS multi-tenant para notarías de fe pública en Bolivia. Dos caras:
1. **Panel interno**: la secretaria/notario crea trámites y avanza su estado con un botón.
2. **Página pública de seguimiento**: el cliente ingresa su código de seguimiento o CI y ve el estado de su trámite en un timeline (estilo tracking de courier). Sin login.

Objetivo de negocio: que la notaría deje de recibir llamadas de "¿ya está mi documento?".

## Stack (NO cambiar sin consultar)
- Next.js 15, App Router, TypeScript estricto
- Server Actions para mutaciones (no crear API REST aparte salvo necesidad real)
- PostgreSQL en Neon + Drizzle ORM
- Tailwind CSS + shadcn/ui
- Auth.js (fase 3+) — roles: NOTARIO, SECRETARIA
- Deploy: Vercel
- Notificaciones WhatsApp (fase 4): Twilio sandbox primero

## Modelo de datos (fuente de verdad)
- **Notaria**: id, nombre, numeroNotaria, ciudad, logoUrl, telefono, createdAt
- **Cliente**: id, notariaId, nombreCompleto, ci, celular, createdAt
- **Tramite**: id, notariaId, clienteId, codigoSeguimiento (único, corto, tipo "NT-8F3K2"), tipo, estadoActual, observaciones, fechaIngreso, fechaEntrega (nullable)
- **HistorialEstado**: id, tramiteId, estado, comentario (nullable), createdAt, usuarioId (nullable hasta fase 3)

### Tipos de trámite (enum)
PODER, ESCRITURA_PUBLICA, TESTIMONIO, PROTOCOLIZACION, RECONOCIMIENTO_FIRMAS, DECLARACION_JURADA, OTRO

### Estados (enum, en este orden — es un flujo lineal)
RECIBIDO → EN_ELABORACION → PARA_FIRMA → PROTOCOLIZADO → LISTO_PARA_RECOGER → ENTREGADO

Regla: el estado solo avanza hacia adelante (botón "Siguiente estado"). Permitir retroceder solo con rol NOTARIO. Todo cambio de estado crea una fila en HistorialEstado.

## Multi-tenancy
- Toda tabla de negocio lleva `notariaId`.
- Toda query del panel interno filtra por la notaría del usuario logueado. NUNCA devolver datos cruzados entre notarías.
- La página pública busca por codigoSeguimiento (global, por eso es único) o por CI + selección de notaría.

## Convenciones de código
- Idioma del código: inglés para variables/funciones, español para textos de UI.
- UI en español boliviano, tono formal-simple (usuarios: secretarias sin perfil técnico).
- Componentes de servidor por defecto; "use client" solo cuando haga falta.
- Validación con Zod en todo input (Server Actions incluidas).
- Nada de lógica en los componentes de página: extraer a `/lib` o `/actions`.
- Commits en español, formato: `fase-N: descripción corta`.

## Estructura de carpetas
```
/app
  /(public)/seguimiento    → página pública de tracking
  /(panel)/panel           → dashboard interno (protegido desde fase 3)
  /api                     → solo webhooks (WhatsApp), nada más
/lib                       → db, utils, lógica de negocio
/actions                   → Server Actions
/components                → UI compartida
/db                        → schema.ts de Drizzle, migraciones, seed
```

## Reglas para Claude Code
1. Trabajamos POR FASES. No adelantar features de fases futuras aunque parezca buena idea.
2. Al terminar una tarea, listar qué archivos se tocaron y cómo probar a mano.
3. Si algo del schema no cuadra con un requerimiento, avisar antes de cambiarlo.
4. Mantener el panel interno ESTÚPIDAMENTE simple: la métrica de éxito es que una secretaria lo use sin capacitación.
5. Mobile-first en el panel: se va a usar desde celular.
6. Datos de seed siempre realistas bolivianos (nombres, CIs de 7-8 dígitos, celulares 7XXXXXXX/6XXXXXXX, trámites notariales reales).

## Estado del proyecto
- [x] Fase 0: Setup
- [x] Fase 1: Modelo de datos + CRUD interno
- [x] Fase 2: Página pública de seguimiento
- [x] Fase 3: Auth + multi-tenancy
- [x] Fase 4: Notificaciones WhatsApp
- [ ] Fase 5: Pulido para demo

(Actualizar esta checklist al cerrar cada fase.)
