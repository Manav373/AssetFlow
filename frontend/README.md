# 💻 AssetFlow Frontend Portal (Next.js)

The **AssetFlow Frontend** is a premium, real-time SPA dashboard built with Next.js 16 (App Router), Tailwind CSS v4, and React hook forms. It provides visually rich charts, real-time Socket.IO synchronization, autocomplete command consoles, and role-based permissions access layouts.

---

## 🛠️ Tech Stack & Design Tokens

*   **Framework**: Next.js 16 (Turbopack support)
*   **Styling**: Tailwind CSS v4 with custom dark themes
*   **State Management & Validation**: React Hook Form + Zod v4 (resolver)
*   **Charts**: Recharts (gradient areas, rounded bars, custom legends)
*   **Animations**: Framer Motion & CSS keyframe triggers
*   **Real-time sync**: Socket.IO client listener hook

---

## ✨ Unique Features & Experiences

1.  **Centered Search & Command Menu**:
    *   Pressing `Ctrl + K` or `Cmd + K` immediately focuses the top navigation search bar.
    *   Autofill options suggest direct page navigations (e.g. *Go to Dashboard*) and filters (e.g. *Show Available Laptops*).
2.  **Modern Loading Animations**:
    *   **YouTube-style Loading Progress**: Animates a gradient loader at the top of the viewport during page routing.
    *   **Dashboard Shimmer Skeletons**: Pre-renders card and grid placeholders using `loading.tsx` when resolving data.
    *   **Chatbot typing dots**: Bouncing 3-dots animation displays when querying the support AI assistant.
3.  **Role Access Control & Restrictions**:
    *   Dynamically filters sidebar menus depending on `user.role` stored in localStorage.
    *   Protects page routes; unauthorized access attempts load an `<AccessDenied />` lock screen.
    *   Filters statistics and holdings automatically according to role scope (Employees view only their own holdings, Department Heads view their department scope).

---

## 🚀 Running Frontend Locally

### 1. Installation
```bash
npm install
```

### 2. Fast Build Configurations
Next.js production compiles are configured to ignore TypeScript checks and ESLint formatting validations to optimize compile speeds:
*   **Configuration**: Defined in `next.config.ts`.
*   **Performance**: Builds complete in under **15 seconds**.

### 3. Start Development Server
```bash
npm run dev
```
*Runs locally on `http://localhost:3000`.*

---

## ⚙️ Next.js Rewrite Rules
A proxy rewrite is configured in `next.config.ts` so that all frontend queries directed to `/api/*` are automatically proxied to the backend at `http://localhost:3001/api/*` without triggering CORS errors.
