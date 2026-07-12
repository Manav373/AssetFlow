/**
 * @module api
 * @description Shared TypeScript interfaces for API request/response contracts.
 *              Frontend uses these as mock interfaces until backend is ready.
 * @authors Developer 3
 * @status In-Progress
 * @collaboration Backend Developer A defines actual DTOs; these mirror the agreed contract.
 */

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  role: "EMPLOYEE"; // Admin selection is never allowed during signup
}

export interface SignupResponse {
  user: User;
}

// ─── User ────────────────────────────────────────────────────────────────────

export type UserRole = "EMPLOYEE" | "MANAGER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  role: UserRole;
  departmentId?: string;
  isActive: boolean;
  createdAt: string;
}

// ─── Department ──────────────────────────────────────────────────────────────

export interface Department {
  id: string;
  code: string;
  name: string;
  headOfDepartment: string;
  status: "Active" | "Inactive";
}

// ─── Asset Category ──────────────────────────────────────────────────────────

export interface AssetCategory {
  id: string;
  name: string;
  parentId?: string;
  children?: AssetCategory[];
}

// ─── Employee (registry listing) ─────────────────────────────────────────────

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  isActive: boolean;
  email: string;
  role: UserRole;
}

// ─── Asset ───────────────────────────────────────────────────────────────────

export type AssetStatus =
  | "Available"
  | "Allocated"
  | "Maintenance"
  | "Retired"
  | "Lost";

export interface Asset {
  id: string;
  tag: string; // e.g. AF-0001
  name: string;
  category: string;
  status: AssetStatus;
  currentHolder?: string;
  location: string;
  serialNumber?: string;
  purchaseDate?: string;
  description?: string;
}

export interface PaginatedAssets {
  data: Asset[];
  total: number;
  page: number;
  pageSize: number;
}
