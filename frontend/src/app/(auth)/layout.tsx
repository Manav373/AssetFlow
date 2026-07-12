/**
 * @module AuthLayout
 * @description Premium split-screen auth layout with animated feature showcase.
 * @authors Developer 3
 * @status Complete
 */

import React from "react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      {/* Left Panel — Feature Showcase */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-secondary/5" />
        <div className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] bg-primary/6 blur-[180px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-150px] left-[-100px] w-[500px] h-[500px] bg-tertiary/5 blur-[150px] rounded-full pointer-events-none" />

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 relative z-10 group">
          <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <span
              className="material-symbols-outlined text-on-primary text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              inventory_2
            </span>
          </div>
          <div>
            <span className="font-hanken font-bold text-2xl text-on-surface leading-none block">
              AssetFlow
            </span>
            <span className="text-[9px] text-on-surface-variant font-mono uppercase tracking-[0.2em]">
              Enterprise Asset Management
            </span>
          </div>
        </Link>

        {/* Feature Cards */}
        <div className="relative z-10 space-y-6 my-auto max-w-lg">
          <h2 className="font-hanken font-bold text-4xl text-on-surface leading-tight">
            Manage every asset.<br />
            <span className="text-primary">Track everything.</span>
          </h2>
          <p className="text-on-surface-variant text-sm leading-relaxed max-w-md">
            AssetFlow provides complete lifecycle management — from procurement and allocation to maintenance, auditing, and retirement.
          </p>

          {/* Feature Pills */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            {[
              { icon: "monitoring", title: "Real-time Tracking", desc: "Live asset monitoring" },
              { icon: "schedule", title: "Resource Booking", desc: "Room & vehicle booking" },
              { icon: "fact_check", title: "Physical Audits", desc: "Cyclic verification" },
              { icon: "build", title: "Maintenance Ops", desc: "Service ticket pipeline" },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-surface/40 backdrop-blur-sm border border-outline-variant/20 rounded-xl p-4 hover:border-primary/30 transition-all group"
              >
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
                  <span className="material-symbols-outlined text-primary text-lg">{f.icon}</span>
                </div>
                <h4 className="text-xs font-bold text-on-surface">{f.title}</h4>
                <p className="text-[10px] text-on-surface-variant mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="relative z-10 flex items-center gap-8 pt-4">
          {[
            { label: "Assets Tracked", value: "1,247+" },
            { label: "Departments", value: "12" },
            { label: "Active Users", value: "86" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-hanken font-bold text-xl text-on-surface">{stat.value}</p>
              <p className="text-[9px] text-on-surface-variant font-mono uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-6 lg:p-12 relative">
        {/* Background blurs for mobile */}
        <div className="lg:hidden absolute top-0 right-0 -z-10 w-[400px] h-[400px] bg-primary/5 blur-[140px] rounded-full pointer-events-none" />
        <div className="lg:hidden absolute bottom-0 left-0 -z-10 w-[300px] h-[300px] bg-tertiary/5 blur-[120px] rounded-full pointer-events-none" />

        {/* Mobile Logo */}
        <Link href="/" className="lg:hidden flex items-center gap-2.5 mb-8 group">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg group-hover:brightness-110 transition-all">
            <span
              className="material-symbols-outlined text-on-primary text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              inventory_2
            </span>
          </div>
          <div>
            <span className="font-hanken font-bold text-xl text-primary leading-none block">
              AssetFlow
            </span>
            <span className="text-[9px] text-on-surface-variant font-mono uppercase tracking-widest">
              Enterprise Management
            </span>
          </div>
        </Link>

        {/* Auth Card */}
        {children}

        {/* Footer */}
        <p className="mt-8 text-[10px] text-on-surface-variant/40 font-mono tracking-wider">
          © 2026 AssetFlow Enterprise · V1.0.0
        </p>
      </div>
    </div>
  );
}
