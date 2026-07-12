/**
 * @module AuthLayout
 * @description Layout wrapper for the (auth) route group.
 *              Centers content on screen with the AssetFlow dark aesthetic.
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
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Atmospheric blurs */}
      <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-tertiary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[800px] h-[800px] bg-secondary/3 blur-[180px] rounded-full pointer-events-none" />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-8 group">
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
  );
}
