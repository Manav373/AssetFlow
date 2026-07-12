"use client";

import React, { useState } from "react";
import Link from "next/link";

interface KPICardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: string;
  colorClass: string;
}

function KPICard({ label, value, subtext, icon, colorClass }: KPICardProps) {
  return (
    <div className="glass-card p-4 rounded-xl flex flex-col justify-between hover:border-primary/40 transition-all select-none">
      <div className="flex justify-between items-start">
        <span className="text-on-surface-variant text-[10px] font-mono uppercase tracking-wider">{label}</span>
        <span className={`material-symbols-outlined text-xl ${colorClass}`}>{icon}</span>
      </div>
      <div className="mt-4">
        <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
        {subtext && <div className="text-on-surface-variant text-xs mt-0.5">{subtext}</div>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [alertDismissed, setAlertDismissed] = useState(false);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h2 className="font-hanken font-bold text-3xl tracking-tight text-on-surface">Welcome back, Admin</h2>
        <p className="text-on-surface-variant text-sm mt-1">
          Here is your operational snapshot of AssetFlow ERP.
        </p>
      </div>

      {/* Overdue Alert Banner */}
      {!alertDismissed && (
        <div className="bg-error-container/30 border border-error/30 rounded-xl p-4 flex justify-between items-center text-error animate-slide-in">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-xl">warning</span>
            <div className="text-sm font-semibold">
              3 assets overdue for return — flagged for automated email reminders.
            </div>
          </div>
          <button
            onClick={() => setAlertDismissed(true)}
            className="text-error hover:text-error-container font-bold text-xs uppercase tracking-wider hover:underline px-2 py-1 transition-all"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard label="Available Assets" value="127" subtext="In Storage" icon="inventory_2" colorClass="text-primary" />
        <KPICard label="Allocated Assets" value="95" subtext="With Holders" icon="assignment_ind" colorClass="text-secondary" />
        <KPICard label="Maintenance" value="04" subtext="Under Service" icon="build" colorClass="text-tertiary" />
        <KPICard label="Active Bookings" value="09" subtext="Today" icon="event_available" colorClass="text-on-surface" />
        <KPICard label="Pending Transfers" value="02" subtext="Needs Approval" icon="swap_horiz" colorClass="text-tertiary" />
        <KPICard label="Upcoming Returns" value="12" subtext="Next 7 Days" icon="assignment_return" colorClass="text-primary" />
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <Link
          href="/assets/new"
          className="bg-primary text-on-primary font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wide hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Register Asset
        </Link>
        <Link
          href="/booking"
          className="bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wide active:scale-95 transition-all flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">calendar_month</span>
          Book Resource
        </Link>
        <Link
          href="/allocation"
          className="bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wide active:scale-95 transition-all flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">notifications_active</span>
          Agree Requests
        </Link>
      </div>

      {/* Details Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity List */}
        <div className="lg:col-span-2 glass-card rounded-xl overflow-hidden shadow-lg">
          <div className="bg-surface-container-high/50 border-b border-outline-variant px-6 py-4 flex justify-between items-center">
            <h3 className="text-xs font-mono text-on-surface font-bold tracking-widest">RECENT WORKFLOW ACTIVITIES</h3>
            <Link href="/notifications" className="text-primary text-xs font-semibold hover:underline">
              See Feed
            </Link>
          </div>

          <div className="divide-y divide-outline-variant/30">
            {[
              {
                id: "1",
                text: "Laptop AF-0196",
                action: "allocated to Priya Shah",
                extra: "IT Department",
                time: "10m ago",
                icon: "assignment_ind",
                iconColor: "text-primary",
              },
              {
                id: "2",
                text: "Conference Room C",
                action: "booking confirmed for stakeholder sync",
                extra: "14:00 - 15:00",
                time: "45m ago",
                icon: "event_available",
                iconColor: "text-secondary",
              },
              {
                id: "3",
                text: "Projector AF-0062",
                action: "maintenance resolved",
                extra: "Resolved by Tech Team",
                time: "2h ago",
                icon: "build",
                iconColor: "text-tertiary",
              },
            ].map((act) => (
              <div key={act.id} className="p-5 flex items-start gap-4 hover:bg-surface-container-high/20 transition-all">
                <div className={`w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0`}>
                  <span className={`material-symbols-outlined text-sm ${act.iconColor}`}>{act.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-on-surface-variant">
                    <span className="text-on-surface font-semibold">{act.text}</span> {act.action}{" "}
                    {act.extra && <span className="text-on-surface font-medium">({act.extra})</span>}
                  </p>
                  <span className="text-[10px] text-on-surface-variant/60 font-mono mt-1 block">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Diagnostics / Statistics panel */}
        <div className="glass-card rounded-xl p-5 flex flex-col justify-between shadow-lg">
          <div className="space-y-4">
            <h3 className="text-xs font-mono text-on-surface-variant font-bold tracking-widest border-b border-outline-variant pb-2">
              DIAGNOSTICS & STATUS
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-on-surface-variant mb-1 font-semibold">
                  <span>Network Sync Status</span>
                  <span className="text-primary">100% Operational</span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[100%] rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-on-surface-variant mb-1 font-semibold">
                  <span>Database Integrity</span>
                  <span className="text-secondary">Fully Secure</span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full w-[95%] rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-on-surface-variant mb-1 font-semibold">
                  <span>Active Service Requests</span>
                  <span className="text-tertiary">4 Pending Approval</span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div className="bg-tertiary h-full w-[35%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant/30 flex justify-between items-center text-xs text-on-surface-variant">
            <span>Server Location: US-East</span>
            <span className="flex items-center gap-1 font-semibold text-primary">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              Live Syncing
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
