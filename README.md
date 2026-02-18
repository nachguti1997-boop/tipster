# Tipster Monorepo

## Prerequisites

- **Node.js** (v18+)
- **pnpm** (v8+)
- **Docker** & **Docker Compose**

## Setup

1.  **Install Dependencies**:
    ```bash
    pnpm install
    ```

2.  **Infrastructure (Database)**:
    Start the PostgreSQL database:
    ```bash
    cd infra
    docker-compose up -d
    ```

3.  **Environment Variables**:
    Copy `.env.example` to `.env` in `apps/api`:
    ```bash
    cp apps/api/.env.example apps/api/.env
    ```

4.  **Database Migration**:
    Push the Prisma schema to the database:
    ```bash
    cd packages/db
    pnpm db:push
    pnpm generate
    ```

## Running the Apps

You can run commands from the root using Turbo:

*   **Development (All Apps)**:
    ```bash
    pnpm dev
    ```

*   **Specific Apps**:
    *   **API**: `cd apps/api && pnpm dev` (Runs on http://localhost:3001)
    *   **Web**: `cd apps/web && pnpm dev` (Runs on http://localhost:3000)
    *   **Mobile**: `cd apps/mobile && pnpm start` (Starts Expo)

## Structure

*   `apps/api`: NestJS Backend
*   `apps/web`: Next.js Frontend
*   `apps/mobile`: React Native (Expo) Mobile App
*   `packages/db`: Prisma Schema and Client
*   `packages/utils`: Shared types and utilities
*   `packages/config`: Shared configurations
*   `infra`: Docker setup
