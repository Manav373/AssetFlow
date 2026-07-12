# Developer 3 — Frontend Infrastructure & Core Modules Guide

**Role**: Frontend Developer (Core Layouts, Auth, Registries, Directory)  
**Stack**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, React Hook Form, Zod

Your responsibilities cover setting up the base app shell, layout shell navigation, authentication views, and core organization setup lists (Departments, Categories, Employees, Assets).

---

## 1. Directory Structure Focus

You will be working primarily inside the `frontend/` folder. Here are the pages and components you own:

```text
frontend/src/
  ├── app/
  │    ├── layout.tsx                     # Global settings, Font loader
  │    ├── page.tsx                       # Portal entry landing page
  │    ├── (dashboard)/
  │    │     ├── layout.tsx               # AppShell (Sidebar & Header navigation)
  │    │     ├── dashboard/page.tsx       # Core KPIs (Work with Dev 4 to integrate charts)
  │    │     ├── org-setup/page.tsx       # Department & Employees registry layout
  │    │     ├── assets/
  │    │     │     ├── page.tsx           # Asset directory list, filters
  │    │     │     └── new/page.tsx       # Register new asset form
  │    │     └── support/page.tsx         # Placeholder/Support screen
  │    └── (auth)/
  │          ├── login/page.tsx           # Login page
  │          ├── signup/page.tsx          # Signup page
  │          └── forgot-password/page.tsx # Password recovery
  └── components/
       ├── ui/                            # Reusable base elements (Buttons, Inputs, Modals)
       └── shared/
             └── ComingSoon.tsx           # Placeholder screen wrapper
```

---

## 2. Step-by-Step Task Checklist

### Task 1: Complete AppShell Navigation
- [x] Create the collapsible `Sidebar` component in `src/app/(dashboard)/layout.tsx`.
- [x] Make sure the links dynamically detect active routes using `usePathname` and apply primary HSL active states.
- [x] Configure search input and quick action ("Add Asset") in the `Header` layout.

### Task 2: Authentication Pages (Auth Group)
- [ ] Implement `src/app/(auth)/login/page.tsx` using a clean form setup.
- [ ] Implement `src/app/(auth)/signup/page.tsx`. **Important**: Never allow users to select "Admin" during signup. Default role is always `EMPLOYEE`.
- [ ] Add form validation using **Zod** schema resolver:
  - Email format validation.
  - Password strength validation (min 8 characters).
- [ ] Integrate with Backend Developer A's auth endpoints (`POST /api/auth/login` and `POST /api/auth/signup`).

### Task 3: Organization Setup View (`/org-setup`)
- [ ] Replace the placeholder view in `src/app/(dashboard)/org-setup/page.tsx` with a tabbed sub-layout:
  - **Departments Tab**: Render a table of active departments with columns: Code, Name, Head of Department, Status.
  - **Asset Categories Tab**: Hierarchical tree directory representing parent-child categories (e.g., Electronics -> Laptops).
  - **Employees Tab**: Employee directory table listing Employee ID, Name, Department, Active Status.
- [ ] Add an "Add Department" modal trigger.

### Task 4: Asset Directory View (`/assets`)
- [ ] Implement the asset directory view in `src/app/(dashboard)/assets/page.tsx`.
- [ ] Add a top filter bar:
  - Search by Tag/Serial/Name.
  - Dropdown select for Category, Location, and Status.
- [ ] Implement a table listing registered assets showing:
  - Asset Tag (AF-0001)
  - Asset Name & Category
  - Status Badge (Available, Allocated, Maintenance, etc.)
  - Current Holder
  - Location
- [ ] Add deep link routing to details: clicking an asset row goes to `/assets/[id]`.

---

## 3. API Contract Coordination Points

Coordinate with **Developer A** (Backend Auth & Registries) for these endpoints:
1. `POST /api/auth/login` -> Send `{ email, password }`, expect `{ accessToken, refreshToken, user }`.
2. `POST /api/auth/signup` -> Send `{ email, password, firstName, lastName, employeeId }`, expect `{ user }`.
3. `GET /api/departments` -> Expect array of departments.
4. `GET /api/assets` -> Expect paginated assets array.
