"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export default function SettingsPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  const [overdueAlerts, setOverdueAlerts] = useState(true);
  const [transferAlerts, setTransferAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // Admin-only configs
  const [autoAssignTech, setAutoAssignTech] = useState(false);
  const [enforceSignoff, setEnforceSignoff] = useState(true);

  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const uStr = localStorage.getItem("user");
      if (uStr) {
        try {
          const user = JSON.parse(uStr);
          setFirstName(user.firstName || "");
          setLastName(user.lastName || "");
          setEmail(user.email || "");
          setRole(user.role || "");
          setEmployeeId(user.employeeId || "");
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (typeof window !== "undefined") {
      const uStr = localStorage.getItem("user");
      if (uStr) {
        try {
          const userObj = JSON.parse(uStr);
          userObj.firstName = firstName;
          userObj.lastName = lastName;
          userObj.email = email;
          localStorage.setItem("user", JSON.stringify(userObj));

          setSuccessMsg("✓ Profile settings saved successfully.");
          setTimeout(() => setSuccessMsg(""), 4000);
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  const isAdmin = role === "ADMIN";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="font-hanken font-bold text-3xl tracking-tight text-on-surface">
          Settings & Configuration
        </h2>
        <p className="text-on-surface-variant text-sm mt-1">
          Manage your personal details, workspace notification presets, and platform defaults.
        </p>
      </div>

      {successMsg && (
        <div className="bg-secondary/15 border border-secondary/35 text-secondary text-sm p-4 rounded-xl font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">task_alt</span>
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Settings Card */}
        <div className="md:col-span-2 glass-card rounded-xl p-6 space-y-4 bg-surface shadow-md">
          <h3 className="font-semibold text-on-surface text-sm border-b border-outline-variant pb-2">
            User Profile Settings
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Employee ID
                </p>
                <p className="font-mono text-xs font-semibold text-on-surface bg-surface-container px-3 py-2.5 rounded border border-outline-variant/30">
                  {employeeId || "AF-001"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Platform Role
                </p>
                <p className="font-mono text-xs font-semibold text-primary bg-primary/10 px-3 py-2.5 rounded border border-primary/20">
                  {role || "EMPLOYEE"}
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="bg-primary text-on-primary font-bold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wide hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* System Preferences Card */}
        <div className="space-y-6">
          <div className="glass-card rounded-xl p-5 space-y-4 bg-surface shadow-md">
            <h3 className="font-semibold text-on-surface text-sm border-b border-outline-variant pb-2">
              Preferences
            </h3>

            <div className="space-y-4">
              {/* Dark Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-on-surface">Dark Mode</p>
                  <p className="text-[10px] text-on-surface-variant">Default dark theme style</p>
                </div>
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant bg-surface-container text-primary focus:ring-primary focus:ring-1 cursor-pointer"
                />
              </div>

              {/* Overdue Alerts */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-on-surface">Overdue Alerts</p>
                  <p className="text-[10px] text-on-surface-variant">Send email on return delays</p>
                </div>
                <input
                  type="checkbox"
                  checked={overdueAlerts}
                  onChange={(e) => setOverdueAlerts(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant bg-surface-container text-primary focus:ring-primary focus:ring-1 cursor-pointer"
                />
              </div>

              {/* Socket Alerts */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-on-surface">Real-Time Alerts</p>
                  <p className="text-[10px] text-on-surface-variant">Enable socket push popups</p>
                </div>
                <input
                  type="checkbox"
                  checked={transferAlerts}
                  onChange={(e) => setTransferAlerts(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant bg-surface-container text-primary focus:ring-primary focus:ring-1 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Admin compliance settings */}
          {isAdmin && (
            <div className="glass-card rounded-xl p-5 space-y-4 bg-surface shadow-md border border-primary/20">
              <h3 className="font-semibold text-primary text-xs uppercase tracking-wider border-b border-outline-variant pb-2">
                Admin Control Panel
              </h3>

              <div className="space-y-4">
                {/* Auto Assign */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-on-surface">Auto-assign support</p>
                    <p className="text-[10px] text-on-surface-variant">Assign tech on ticket raised</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoAssignTech}
                    onChange={(e) => setAutoAssignTech(e.target.checked)}
                    className="w-4 h-4 rounded border-outline-variant bg-surface-container text-primary focus:ring-primary focus:ring-1 cursor-pointer"
                  />
                </div>

                {/* Enforce sign-off */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-on-surface">Enforce sign-off</p>
                    <p className="text-[10px] text-on-surface-variant">Require multi-stage transfer</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enforceSignoff}
                    onChange={(e) => setEnforceSignoff(e.target.checked)}
                    className="w-4 h-4 rounded border-outline-variant bg-surface-container text-primary focus:ring-primary focus:ring-1 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
