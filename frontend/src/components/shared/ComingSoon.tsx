import React from "react";
import Link from "next/link";

interface ComingSoonProps {
  title: string;
  description: string;
  icon: string;
}

export default function ComingSoon({ title, description, icon }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 space-y-6 glass-card rounded-2xl max-w-lg mx-auto shadow-xl">
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shadow-md animate-pulse">
        <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      </div>

      <div className="space-y-2">
        <h3 className="font-hanken font-bold text-2xl text-on-surface">{title}</h3>
        <p className="text-on-surface-variant text-sm max-w-sm leading-relaxed mx-auto">
          {description}
        </p>
      </div>

      <div className="bg-surface-container-high/40 border border-outline-variant/50 rounded-lg px-4 py-2 text-[11px] font-mono text-on-surface-variant">
        MODULE STATUS: UNDER SYSTEM ARCHITECTURE
      </div>

      <Link
        href="/dashboard"
        className="bg-primary text-on-primary font-bold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wide hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Return to Dashboard
      </Link>
    </div>
  );
}
