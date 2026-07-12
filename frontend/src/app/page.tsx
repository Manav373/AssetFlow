"use client";

import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-on-background flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Atmospheric Background Blurs */}
      <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -z-10 w-[300px] h-[300px] bg-tertiary/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-md w-full text-center space-y-8 glass-card p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-on-primary text-3xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
              inventory_2
            </span>
          </div>
          <div>
            <h1 className="font-hanken font-bold text-3xl tracking-tight text-primary">AssetFlow</h1>
            <p className="text-[11px] text-on-surface-variant font-mono uppercase tracking-widest mt-1">
              Enterprise Asset & Resource Management
            </p>
          </div>
        </div>

        <p className="text-on-surface-variant text-sm leading-relaxed">
          Welcome to the AssetFlow ERP portal. Securely track, allocate, transfer, book, and audit physical assets and shared resources.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg text-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Go to Dashboard
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
          
          <div className="flex gap-2">
            <Link
              href="/notifications"
              className="flex-1 bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-xs">notifications</span>
              Notifications
            </Link>
            <Link
              href="/reports"
              className="flex-1 bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-xs">analytics</span>
              Analytics
            </Link>
          </div>
        </div>

        <div className="text-[10px] text-on-surface-variant/50 font-mono">
          V1.0.0-PROD • STITCH ENTERPRISE INTERACTIVE
        </div>
      </div>
    </main>
  );
}
