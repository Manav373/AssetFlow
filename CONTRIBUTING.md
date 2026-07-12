# AssetFlow — Team Contribution & Collaboration Guide

This document describes how to structure, code, and log contributions across the **frontend** and **backend** teams. Following these guidelines ensures that both human developers and AI assistants (like Claude, Gemini, etc.) can immediately understand who owns what and how modules link together.

---

## 1. Directory Structure

```text
/odoo2
  ├── /frontend              # Next.js 15 UI Code (React, Tailwind v4, Recharts)
  ├── /backend               # NestJS API Engine (Prisma, PostgreSQL, Socket.IO)
  └── CONTRIBUTING.md        # This file
```

---

## 2. In-Code Contribution Signatures

To help team members and AI assistants track file ownership, every major file (components, services, modules, controllers) should start with a JSDoc-style metadata block:

```typescript
/**
 * @module AssetBooking
 * @description Calendar view and time-slot overlap collision checker.
 * @authors [Your Name], [Your Friend's Name]
 * @status In-Progress / Under Construction
 * @collaboration Frontend team consumes POST /api/bookings payload
 */
```

### For Shared/Joint Files:
If you modify someone else's file or collaborate on it, add a inline comment block above your change:

```typescript
// --- START: Collaborative edit by [Name] & [Friend] ---
// Added Socket.IO emit hook for real-time dashboard syncs
socket.emit('dashboard:refresh', payload);
// --- END: Collaborative edit ---
```

---

## 3. Git Commit Contribution Logging (Co-Authorship)

To show joint contribution on GitHub, use **Co-authored commits**. When committing work done together (like pair-programming on API integration), append `Co-authored-by` metadata at the very bottom of the commit message (separated by a blank line):

```text
feat: integrate asset allocation check-in workflow

- Created allocations controller and return-inspection service
- Added frontend check-in validation dialogs

Co-authored-by: Developer A <dev-a@example.com>
Co-authored-by: Developer C <dev-c@example.com>
```

---

## 4. API & Integration Contract Flow

To avoid blocking each other:
1. **Mock First**: The backend team defines the TypeScript DTOs.
2. **Commit Contract**: Save the agreed JSON request/response formats in a shared mock file (e.g. `frontend/src/types/api.ts`).
3. **Frontend Development**: The frontend team uses the mock interfaces to build UI states (loading, empty, success).
4. **Backend Development**: The backend team implements the database queries and validation pipes.
5. **Join Up**: Once endpoints are ready, replace the mock base URL with the local NestJS dev server URL (`http://localhost:3001`).

---

## 5. Development Workspace Commands

### Frontend Setup & Launch:
```bash
# From root directory
cd frontend
npm install
npm run dev
```

### Backend Setup & Launch:
```bash
# From root directory
cd backend
npm install
npm run start:dev
```
