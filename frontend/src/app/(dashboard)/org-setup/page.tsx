"use client";

import React, { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiFetch } from "@/lib/api";
import { useWebsockets } from "@/hooks/useWebsockets";
import type { Department, AssetCategory, Employee } from "@/types/api";

// ─── Add Department Form ─────────────────────────────────────────────────────

const addDeptSchema = z.object({
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(8, "Code is too long")
    .regex(/^[A-Z]+$/, "Use uppercase letters only"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  headId: z.string().optional(),
});

type AddDeptForm = z.infer<typeof addDeptSchema>;

// ─── Sub-components ──────────────────────────────────────────────────────────

function CategoryNode({
  category,
  depth = 0,
}: {
  category: AssetCategory;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(depth === 0);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-surface-container-high/40 transition-all cursor-pointer group ${
          depth === 0 ? "font-semibold text-on-surface" : "text-on-surface-variant"
        }`}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          <span className="material-symbols-outlined text-sm text-on-surface-variant group-hover:text-primary transition-colors">
            {expanded ? "expand_more" : "chevron_right"}
          </span>
        ) : (
          <span className="w-4 h-4 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-outline" />
          </span>
        )}
        <span
          className="material-symbols-outlined text-sm"
          style={{
            color:
              depth === 0
                ? "var(--primary)"
                : depth === 1
                ? "var(--secondary)"
                : "var(--on-surface-variant)",
            fontVariationSettings: "'FILL' 1",
          }}
        >
          {depth === 0 ? "folder" : depth === 1 ? "folder_open" : "description"}
        </span>
        <span className="text-sm">{category.name}</span>
        {category.children && (
          <span className="ml-auto text-[10px] font-mono text-on-surface-variant/50 opacity-0 group-hover:opacity-100 transition-opacity">
            {category.children.length} items
          </span>
        )}
      </div>
      {expanded && hasChildren && (
        <div>
          {category.children!.map((child) => (
            <CategoryNode key={child.id} category={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

type Tab = "departments" | "categories" | "employees";

export default function OrgSetupPage() {
  const [activeTab, setActiveTab] = useState<Tab>("departments");
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categoriesTree, setCategoriesTree] = useState<AssetCategory[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddDeptForm>({ resolver: zodResolver(addDeptSchema) });

  const loadData = useCallback(async () => {
    try {
      // 1. Fetch Departments
      const depts = await apiFetch("/departments");
      setDepartments(
        depts.map((d: any) => ({
          id: d.id,
          code: d.code,
          name: d.name,
          headOfDepartment: d.headId && d.users ? `${d.users.firstName} ${d.users.lastName}` : "No Head Assigned",
          status: d.isActive ? "Active" : "Inactive",
        }))
      );

      // 2. Fetch Categories Tree
      const tree = await apiFetch("/categories/tree");
      setCategoriesTree(tree);

      // 3. Fetch Employees (Users)
      const users = await apiFetch("/auth/users");
      setEmployees(
        users.map((u: any) => ({
          id: u.id,
          employeeId: u.employeeId,
          name: `${u.firstName} ${u.lastName}`,
          department: u.department?.name || "Unassigned",
          isActive: u.isActive,
          email: u.email,
          role: u.role,
        }))
      );
    } catch (err: any) {
      console.error("Error loading org setup details:", err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time updates
  useWebsockets({
    onDashboardRefresh: () => {
      loadData();
    },
  });

  const onAddDepartment = async (data: AddDeptForm) => {
    setServerError("");
    try {
      await apiFetch("/departments", {
        method: "POST",
        body: JSON.stringify({
          code: data.code,
          name: data.name,
          headId: data.headId || undefined,
        }),
      });
      reset();
      setIsAddDeptOpen(false);
      loadData();
    } catch (err: any) {
      setServerError(err.message || "Failed to create department. Code may be duplicate.");
    }
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "departments", label: "Departments", icon: "corporate_fare" },
    { key: "categories", label: "Asset Categories", icon: "category" },
    { key: "employees", label: "Employees", icon: "group" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-hanken font-bold text-3xl tracking-tight text-on-surface">
            Organization Setup
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Manage departments, asset categories, and employee registries.
          </p>
        </div>
        {activeTab === "departments" && (
          <button
            id="add-department-btn"
            onClick={() => setIsAddDeptOpen(true)}
            className="bg-primary text-on-primary font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wide hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Department
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="glass-card rounded-xl overflow-hidden shadow-lg">
        {/* Tab Bar */}
        <div className="flex border-b border-outline-variant bg-surface-container-high/30">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              id={`tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all relative cursor-pointer ${
                activeTab === tab.key
                  ? "text-primary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/20"
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-0 bg-surface">
          {/* ── Departments Tab ── */}
          {activeTab === "departments" && (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container/50">
                      <th className="text-left px-6 py-3.5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
                        Code
                      </th>
                      <th className="text-left px-6 py-3.5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
                        Department Name
                      </th>
                      <th className="text-left px-6 py-3.5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
                        Head of Department
                      </th>
                      <th className="text-left px-6 py-3.5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {departments.map((dept) => (
                      <tr
                        key={dept.id}
                        className="hover:bg-surface-container-high/20 transition-all group"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs bg-surface-container px-2 py-1 rounded text-primary font-semibold">
                            {dept.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-on-surface">
                          {dept.name}
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                              {dept.headOfDepartment.charAt(0)}
                            </div>
                            {dept.headOfDepartment}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              dept.status === "Active"
                                ? "bg-primary/10 text-primary"
                                : "bg-outline-variant/30 text-on-surface-variant"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                dept.status === "Active"
                                  ? "bg-primary"
                                  : "bg-outline"
                              }`}
                            />
                            {dept.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {departments.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-xs italic text-on-surface-variant">
                          No departments seeded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 border-t border-outline-variant/30 flex items-center justify-between">
                <span className="text-xs text-on-surface-variant font-mono">
                  {departments.length} departments total
                </span>
                <span className="text-xs text-on-surface-variant font-mono">
                  {departments.filter((d) => d.status === "Active").length}{" "}
                  active
                </span>
              </div>
            </div>
          )}

          {/* ── Asset Categories Tab ── */}
          {activeTab === "categories" && (
            <div className="p-4 bg-surface">
              <div className="flex items-center justify-between mb-4 px-2">
                <p className="text-xs text-on-surface-variant">
                  Click categories to expand or collapse their sub-items.
                </p>
                <span className="text-[10px] font-mono text-on-surface-variant/50">
                  {categoriesTree.length} top-level categories
                </span>
              </div>
              <div className="space-y-1">
                {categoriesTree.map((cat) => (
                  <CategoryNode key={cat.id} category={cat} />
                ))}
              </div>
            </div>
          )}

          {/* ── Employees Tab ── */}
          {activeTab === "employees" && (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container/50">
                      <th className="text-left px-6 py-3.5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
                        Employee ID
                      </th>
                      <th className="text-left px-6 py-3.5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
                        Name
                      </th>
                      <th className="text-left px-6 py-3.5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
                        Department
                      </th>
                      <th className="text-left px-6 py-3.5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
                        Role
                      </th>
                      <th className="text-left px-6 py-3.5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {employees.map((emp) => (
                      <tr
                        key={emp.id}
                        className="hover:bg-surface-container-high/20 transition-all"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-on-surface-variant">
                            {emp.employeeId}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-bold text-secondary shrink-0">
                              {emp.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <div className="font-medium text-on-surface">
                                {emp.name}
                              </div>
                              <div className="text-[11px] text-on-surface-variant">
                                {emp.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">
                          {emp.department}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-[11px] font-mono font-semibold ${
                              emp.role === "MANAGER"
                                ? "text-tertiary"
                                : "text-on-surface-variant"
                            }`}
                          >
                            {emp.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              emp.isActive
                                ? "bg-primary/10 text-primary"
                                : "bg-error-container/20 text-error"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                emp.isActive ? "bg-primary" : "bg-error"
                              }`}
                            />
                            {emp.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 border-t border-outline-variant/30 flex items-center justify-between">
                <span className="text-xs text-on-surface-variant font-mono">
                  {employees.length} employees total
                </span>
                <span className="text-xs text-on-surface-variant font-mono">
                  {employees.filter((e) => e.isActive).length} active
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Department Modal */}
      <Modal
        isOpen={isAddDeptOpen}
        onClose={() => {
          setIsAddDeptOpen(false);
          reset();
          setServerError("");
        }}
        title="Add Department"
      >
        <form onSubmit={handleSubmit(onAddDepartment)} className="space-y-4" noValidate>
          {serverError && (
            <div className="flex items-center gap-2 bg-error/10 border border-error/25 rounded-lg px-4 py-2.5 text-error text-xs">
              <span className="material-symbols-outlined text-xs">error_outline</span>
              {serverError}
            </div>
          )}

          {/* Code */}
          <div className="space-y-1.5">
            <label
              htmlFor="dept-code"
              className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider"
            >
              Department Code
            </label>
            <input
              id="dept-code"
              {...register("code")}
              placeholder="e.g. IT, HR, FIN"
              className={`w-full bg-surface-container-low border rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all focus:ring-2 focus:ring-primary/50 focus:border-primary font-mono uppercase ${
                errors.code ? "border-error" : "border-outline-variant"
              }`}
            />
            {errors.code && (
              <p className="text-error text-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">error_outline</span>
                {errors.code.message}
              </p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="dept-name"
              className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider"
            >
              Department Name
            </label>
            <input
              id="dept-name"
              {...register("name")}
              placeholder="e.g. Information Technology"
              className={`w-full bg-surface-container-low border rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all focus:ring-2 focus:ring-primary/50 focus:border-primary ${
                errors.name ? "border-error" : "border-outline-variant"
              }`}
            />
            {errors.name && (
              <p className="text-error text-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">error_outline</span>
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Head of Department Dropdown */}
          <div className="space-y-1.5">
            <label
              htmlFor="dept-head"
              className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider"
            >
              Head of Department
            </label>
            <select
              id="dept-head"
              {...register("headId")}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-sm text-on-surface outline-none transition-all focus:ring-2 focus:ring-primary/50 focus:border-primary cursor-pointer"
            >
              <option value="">Select an employee (optional)</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsAddDeptOpen(false);
                reset();
                setServerError("");
              }}
              className="flex-1 bg-surface-container border border-outline-variant text-on-surface font-semibold py-2.5 rounded-lg text-sm hover:bg-surface-container-high transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="add-dept-submit"
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary text-on-primary font-bold py-2.5 rounded-lg text-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
              ) : (
                "Add Department"
              )}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
