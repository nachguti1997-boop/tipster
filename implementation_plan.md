# Plan de Implementación: Tipster (Propinas por QR)

## 1. Stack Tecnológico Recomendado

### Mobile
*   **React Native con Expo**
    *   Un solo código base iOS/Android.
    *   Gestión sencilla de cámara (QR) y notificaciones push.
    *   Actualizaciones OTA.

### Web
*   **Next.js (App Router)**
    *   Landing pública con SEO.
    *   Dashboard SSR para rendimiento.
    *   Página pública de pago accesible vía QR (sin necesidad de app).

### Backend
*   **NestJS + Fastify**
    *   Arquitectura modular.
    *   DTOs y validación fuerte.
    *   Escalable.

### Base de Datos
*   **PostgreSQL + Prisma ORM**
    *   Transacciones seguras.
    *   Migraciones tipadas.
    *   Excelente DX.

### Pagos
*   **Stripe Connect (modo plataforma)**
    *   La plataforma crea PaymentIntent.
    *   Confirmación vía webhook.
    *   Transferencias/payouts posteriores al worker/business.
    *   Uso de idempotencia con stripePaymentIntentId UNIQUE.

### Push
*   **Expo Push Notifications**

## 2. Estructura Monorepo (Turborepo)

```
/
├── apps/
│   ├── api/        # NestJS
│   ├── web/        # Next.js
│   └── mobile/     # Expo React Native
├── packages/
│   ├── db/         # Prisma schema + client
│   ├── utils/      # Tipos/DTOs compartidos
│   ├── config/     # ESLint, TSConfig, Prettier
│   └── ui/         # Componentes compartidos (opcional)
├── infra/          # Docker y configuración infraestructura
└── package.json
```

## 3. Modelo de Datos Definitivo

### Roles (Enum)
*   `CLIENT`
*   `WORKER`
*   `BUSINESS`
*   `ADMIN_SUPPORT`

### 1) User
Base de autenticación.
*   `id`: UUID (PK)
*   `email`: String (Unique)
*   `passwordHash`: String
*   `role`: Enum(CLIENT, WORKER, BUSINESS, ADMIN_SUPPORT)
*   `createdAt`: DateTime
*   `updatedAt`: DateTime

### 2) WorkerProfile
Perfil del trabajador.
*   `id`: UUID (PK)
*   `userId`: UUID (FK User, Unique)
*   `businessId`: UUID (Nullable FK BusinessProfile) -> *Nullable permite workers independientes.*
*   `linkStatus`: Enum(NONE, INVITED, ACTIVE, REJECTED) (default NONE)
*   `displayName`: String
*   `qrSlug`: String (Unique, Indexed)
*   `bio`: String (Optional)
*   `photoUrl`: String (Optional)
*   `stripeAccountId`: String (Optional)
*   `isActive`: Boolean (default true)
*   `createdAt`: DateTime

### 3) BusinessProfile
*   `id`: UUID (PK)
*   `userId`: UUID (FK User, Unique)
*   `companyName`: String
*   `address`: String
*   `logoUrl`: String (Optional)
*   `stripeAccountId`: String (Optional)
*   `createdAt`: DateTime

### 4) Tip
*   `id`: UUID (PK)
*   `amount`: Int (guardar en céntimos)
*   `currency`: String (ej: "EUR")
*   `status`: Enum(PENDING, CONFIRMED, FAILED, REFUNDED)
*   `stripePaymentIntentId`: String (Unique) -> *Garantiza idempotencia en webhook.*
*   `payerId`: UUID (Nullable FK User)
*   `payerName`: String (Optional)
*   `message`: String (Optional)
*   `workerId`: UUID (FK WorkerProfile)
*   `businessId`: UUID (Nullable FK BusinessProfile)
*   `createdAt`: DateTime

### 5) Notification
*   `id`: UUID (PK)
*   `userId`: UUID (FK User)
*   `type`: Enum(POSITIVE, SUPPORT, ALERT)
*   `title`: String
*   `body`: String
*   `linkTarget`: String
*   `readAt`: DateTime (Nullable)
*   `createdAt`: DateTime

### 6) SupportTicket
*   `id`: UUID (PK)
*   `userId`: UUID (FK User)
*   `category`: String
*   `description`: String
*   `status`: Enum(OPEN, IN_PROGRESS, CLOSED)
*   `createdAt`: DateTime

### 7) SuspiciousEvent
*   `id`: UUID (PK)
*   `userId`: UUID (Nullable FK User)
*   `type`: String
*   `severity`: Enum(LOW, MEDIUM, HIGH)
*   `metadata`: JSON
*   `createdAt`: DateTime

## 4. Endpoints REST Mínimos (MVP)

Prefix: `/api/v1`

### Auth
*   `POST /auth/register`
*   `POST /auth/login`
*   `GET /me`

### Público
*   `GET /public/workers/:qrSlug`

### Worker (Privado)
*   `PATCH /workers/me`
*   `GET /tips/history`
*   `GET /stats/summary`

### Payments
*   `POST /payments/create-intent`
    *   Body: `{ amount, currency, workerQrSlug, message?, payerName? }`
    *   Response: `{ clientSecret }`
*   `POST /payments/webhook` (Stripe webhook)

### Notificaciones
*   `POST /notifications/register-device`
*   `GET /notifications`

### Soporte
*   `POST /support/ticket`

## 5. Roadmap

### MVP
*   Registro worker.
*   Generación qrSlug único.
*   Página pública de pago.
*   Stripe PaymentIntent + webhook.
*   Dashboard simple con historial.

### V1
*   Perfiles de negocio.
*   Vinculación workers ↔ business.
*   Notificaciones push en tiempo real.
*   Payouts automáticos.
*   Página QR por mesa (selección worker).
