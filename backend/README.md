# ⚙️ AssetFlow Backend API Server (NestJS)

The **AssetFlow Backend** is a modular, high-performance API server built with NestJS, TypeScript, and Prisma ORM, using SQLite for lightweight persistent data storage. It features real-time synchronization utilizing Socket.IO and runs with accelerated Rust-based compilation.

---

## 🛠️ Tech Stack & Architecture

*   **Core Framework**: NestJS (v11+)
*   **Database ORM**: Prisma Client (v7+)
*   **Database**: SQLite (`dev.db` locally)
*   **Real-time Gateway**: Socket.IO (`@nestjs/platform-socket.io`)
*   **Compiler Engine**: Rust-based SWC (`@swc/core` & `@swc/cli`)
*   **Security & Guards**: Passport JWT (`@nestjs/jwt`) & bcrypt password hashing

---

## 📂 Active Core Modules

1.  **Auth Module (`src/modules/auth`)**:
    *   Handles user registrations, JWT login credentials validation, password resets, and session refreshes.
    *   Decorators restrict route accesses based on role memberships (`ADMIN`, `ASSET_MANAGER`, `DEPARTMENT_HEAD`, `EMPLOYEE`).
2.  **Assets Module (`src/modules/assets`)**:
    *   Manages inventory listings, categorization, location registry, and custom lookup logic.
3.  **Allocations Module (`src/modules/allocations`)**:
    *   Tracks checkouts, active holder assignments, and check-in return inspection logs.
4.  **Transfers Module (`src/modules/transfers`)**:
    *   Powers the multi-stage department transfer request flow with approvals.
5.  **Bookings Module (`src/modules/bookings`)**:
    *   Schedules shared workspaces and fleet resources, validating slot conflicts.
6.  **Maintenance Module (`src/modules/maintenance`)**:
    *   Handles issue tickets and technician updates on the Kanban board pipeline.
7.  **Audits Module (`src/modules/audits`)**:
    *   Manages cyclic inventory audits, verify statuses, and discrepancy logs.
8.  **Gateway Module (`src/modules/gateway`)**:
    *   Exposes a WebSocket Notification Gateway which broadcasts a `dashboard:refresh` refresh signal to active clients on database modifications.

---

## ⚡ Accelerated SWC Rebuilding

This backend project compiles and reloads in **milliseconds** by using the SWC Rust-based compiler.
*   **Configuration**: Set `"builder": "swc"` in `nest-cli.json`.
*   **Speed**: Cuts watcher rebuild times down from 6s to under 150ms.

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Database Migrations & Seeding
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 3. Running Server (Watch Mode)
```bash
npm run start:dev
```
*Listens on `http://localhost:3001/api`.*

---

## 📡 REST API Endpoints Overview

| Method | Endpoint | Description | Guard |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/signup` | Register new employee | Open |
| **POST** | `/api/auth/login` | Login and retrieve JWT token | Open |
| **GET** | `/api/auth/users` | List registered employees | JWT |
| **GET** | `/api/assets` | Retrieve assets list | JWT |
| **GET** | `/api/assets/:id` | Fetch specific asset details | JWT |
| **GET** | `/api/assets/locations` | Get active location areas | JWT |
| **POST** | `/api/bookings` | Book a shared resource | JWT |
| **GET** | `/api/bookings` | List active bookings | JWT |
| **POST** | `/api/maintenance` | Raise service ticket | JWT |
| **PATCH** | `/api/maintenance/:id` | Update ticket status / assignee | JWT |
| **GET** | `/api/audits/cycles` | Fetch audit rounds history | JWT |
| **POST** | `/api/audits/verifications` | Log asset audit verification check | JWT |
