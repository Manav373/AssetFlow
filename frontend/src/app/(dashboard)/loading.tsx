"use client";

import React from "react";

export default function DashboardLoading() {
  return (
    <div className="relative w-full h-full min-h-[80vh] flex flex-col justify-start">
      
      {/* YouTube-style Top Loading Progress Bar */}
      <div className="absolute top-[-24px] left-[-24px] right-[-24px] h-[3px] bg-gradient-to-r from-primary via-secondary to-tertiary animate-pulse z-50 overflow-hidden">
        <div className="h-full bg-primary/40 w-full animate-[loading-bar_2s_infinite_linear]" />
      </div>

      <style jsx global>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Shimmer / Skeleton Landing Page Dashboard */}
      <div className="space-y-6 animate-pulse">
        {/* Welcome Header Skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-64 bg-surface-container-highest/60 rounded-lg" />
          <div className="h-4 w-96 bg-surface-container-highest/40 rounded-lg" />
        </div>

        {/* KPI Cards Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-surface-container/40 border border-outline-variant/20 rounded-xl p-4 h-28 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div className="h-3 w-16 bg-surface-container-highest/60 rounded" />
                <div className="w-6 h-6 bg-surface-container-highest/60 rounded-full" />
              </div>
              <div className="space-y-1.5 mt-4">
                <div className="h-6 w-10 bg-surface-container-highest/60 rounded" />
                <div className="h-3 w-20 bg-surface-container-highest/40 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Content Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Main List Box */}
          <div className="lg:col-span-2 bg-surface-container/30 border border-outline-variant/20 rounded-xl p-5 space-y-4">
            <div className="h-4 w-40 bg-surface-container-highest/60 rounded" />
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-outline-variant/10 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-highest/60" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-40 bg-surface-container-highest/60 rounded" />
                      <div className="h-2.5 w-24 bg-surface-container-highest/40 rounded" />
                    </div>
                  </div>
                  <div className="h-3.5 w-16 bg-surface-container-highest/50 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Stats Box */}
          <div className="bg-surface-container/30 border border-outline-variant/20 rounded-xl p-5 flex flex-col justify-between min-h-[300px]">
            <div className="space-y-4">
              <div className="h-4 w-32 bg-surface-container-highest/60 rounded" />
              <div className="h-28 bg-surface-container-highest/40 rounded-lg flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-surface-container border-t-primary animate-spin" />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="h-3 w-full bg-surface-container-highest/40 rounded" />
              <div className="h-3 w-5/6 bg-surface-container-highest/40 rounded" />
            </div>
          </div>
        </div>

        {/* Centered Bouncing 3-Dots Animation */}
        <div className="flex flex-col items-center justify-center py-10 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-3.5 h-3.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-3.5 h-3.5 bg-tertiary rounded-full animate-bounce" />
          </div>
          <span className="text-xs text-on-surface-variant font-mono uppercase tracking-widest animate-pulse">
            Syncing workspace data
          </span>
        </div>

      </div>
    </div>
  );
}
