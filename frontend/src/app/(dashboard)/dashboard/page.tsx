"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useWebsockets } from "@/hooks/useWebsockets";

interface KPICardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: string;
  colorClass: string;
}

function KPICard({ label, value, subtext, icon, colorClass }: KPICardProps) {
  return (
    <div className="glass-card p-4 rounded-xl flex flex-col justify-between hover:border-primary/40 transition-all select-none bg-surface">
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
  const [userName, setUserName] = useState("Admin");
  const [stats, setStats] = useState({
    available: 0,
    allocated: 0,
    maintenance: 0,
    bookings: 0,
    transfers: 0,
    overdue: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      const assetsRes = await apiFetch("/assets?limit=150");
      const bookingsRes = await apiFetch("/bookings");
      const transfersRes = await apiFetch("/transfers");
      const maintenanceRes = await apiFetch("/maintenance");

      const totalAssets = assetsRes.data || [];
      const avail = totalAssets.filter((a: any) => a.status === "AVAILABLE").length;
      const alloc = totalAssets.filter((a: any) => a.status === "ALLOCATED").length;
      const maint = totalAssets.filter((a: any) => a.status === "UNDER_MAINTENANCE" || a.status === "UNDER_SERVICE").length;

      const activeBookings = bookingsRes.filter((b: any) => b.status === "UPCOMING" || b.status === "ONGOING").length;
      const pendingTrans = transfersRes.filter((t: any) => t.status === "REQUESTED" || t.status === "DEPT_HEAD_APPROVED").length;

      // Count overdue allocations (expected return date is in the past and status is ACTIVE)
      let overdueCount = 0;
      const now = new Date().getTime();
      totalAssets.forEach((asset: any) => {
        (asset.allocations || []).forEach((al: any) => {
          if (al.status === "ACTIVE" && al.expectedReturnDate && new Date(al.expectedReturnDate).getTime() < now) {
            overdueCount++;
          }
        });
      });

      setStats({
        available: avail,
        allocated: alloc,
        maintenance: maint || maintenanceRes.filter((m: any) => m.status !== "RESOLVED" && m.status !== "CLOSED").length,
        bookings: activeBookings,
        transfers: pendingTrans,
        overdue: overdueCount,
      });

      // Construct dynamic activities feed
      const activities: any[] = [];

      // Allocations
      totalAssets.forEach((asset: any) => {
        (asset.allocations || []).forEach((alloc: any) => {
          activities.push({
            id: `alloc-${alloc.id}`,
            text: asset.name,
            action: `allocated to ${alloc.allocatedTo?.firstName} ${alloc.allocatedTo?.lastName}`,
            extra: asset.department?.name || "Company",
            time: new Date(alloc.allocationDate),
            icon: "assignment_ind",
            iconColor: "text-primary",
          });
        });
      });

      // Bookings
      bookingsRes.forEach((b: any) => {
        activities.push({
          id: `book-${b.id}`,
          text: b.asset?.name || "Resource",
          action: `booking confirmed for ${b.bookedBy?.firstName} ${b.bookedBy?.lastName}`,
          extra: `${new Date(b.startTime).getHours()}:00 - ${new Date(b.endTime).getHours()}:00`,
          time: new Date(b.startTime),
          icon: "event_available",
          iconColor: "text-secondary",
        });
      });

      // Maintenance Requests
      maintenanceRes.forEach((m: any) => {
        activities.push({
          id: `maint-${m.id}`,
          text: m.asset?.name || "Asset",
          action: `maintenance ticket raised: "${m.title}"`,
          extra: m.status.replace("_", " "),
          time: new Date(m.createdAt || new Date()),
          icon: "build",
          iconColor: "text-tertiary",
        });
      });

      // Sort activities descending by time
      activities.sort((a, b) => b.time.getTime() - a.time.getTime());

      // Format relative times
      const formatted = activities.slice(0, 5).map((act) => {
        const diffMs = Date.now() - act.time.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);

        let relative = "Just now";
        if (diffHours > 0) {
          relative = `${diffHours}h ago`;
        } else if (diffMins > 0) {
          relative = `${diffMins}m ago`;
        }

        return {
          ...act,
          time: relative,
        };
      });

      setRecentActivities(formatted);
    } catch (err) {
      console.error("Error loading dashboard metrics:", err);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const uStr = localStorage.getItem("user");
      if (uStr) {
        try {
          const userObj = JSON.parse(uStr);
          setUserName(userObj.firstName || "Admin");
        } catch (e) {
          console.error(e);
        }
      }
    }
    loadData();
  }, [loadData]);

  // WebSocket Live Sync
  useWebsockets({
    onDashboardRefresh: () => {
      loadData();
    },
  });

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h2 className="font-hanken font-bold text-3xl tracking-tight text-on-surface">
          Welcome back, {userName}
        </h2>
        <p className="text-on-surface-variant text-sm mt-1">
          Here is your operational snapshot of AssetFlow ERP.
        </p>
      </div>

      {/* Overdue Alert Banner */}
      {!alertDismissed && stats.overdue > 0 && (
        <div className="bg-error-container/30 border border-error/30 rounded-xl p-4 flex justify-between items-center text-error animate-slide-in">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-xl">warning</span>
            <div className="text-sm font-semibold">
              {stats.overdue} assets overdue for return — flagged for automated email reminders.
            </div>
          </div>
          <button
            onClick={() => setAlertDismissed(true)}
            className="text-error hover:text-error-container font-bold text-xs uppercase tracking-wider hover:underline px-2 py-1 transition-all cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard label="Available Assets" value={String(stats.available)} subtext="In Storage" icon="inventory_2" colorClass="text-success" />
        <KPICard label="Allocated Assets" value={String(stats.allocated)} subtext="With Holders" icon="assignment_ind" colorClass="text-info" />
        <KPICard label="Maintenance" value={String(stats.maintenance)} subtext="Under Service" icon="build" colorClass="text-warning" />
        <KPICard label="Active Bookings" value={String(stats.bookings)} subtext="Total Scheduled" icon="event_available" colorClass="text-secondary" />
        <KPICard label="Pending Transfers" value={String(stats.transfers)} subtext="Needs Approval" icon="swap_horiz" colorClass="text-tertiary" />
        <KPICard label="Overdue Returns" value={String(stats.overdue)} subtext="Action Required" icon="assignment_return" colorClass="text-error" />
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
        <div className="lg:col-span-2 glass-card rounded-xl overflow-hidden shadow-lg bg-surface">
          <div className="bg-surface-container-high/50 border-b border-outline-variant px-6 py-4 flex justify-between items-center">
            <h3 className="text-xs font-mono text-on-surface font-bold tracking-widest">RECENT WORKFLOW ACTIVITIES</h3>
          </div>

          <div className="divide-y divide-outline-variant/30">
            {recentActivities.map((act) => (
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
            {recentActivities.length === 0 && (
              <div className="p-8 text-center text-xs text-on-surface-variant italic">
                No recent workflow logs. Perform checkout or bookings.
              </div>
            )}
          </div>
        </div>

        {/* Quick Diagnostics / Statistics panel */}
        <div className="glass-card rounded-xl p-5 flex flex-col justify-between shadow-lg bg-surface">
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
                  <div className="bg-secondary h-full w-[100%] rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-on-surface-variant mb-1 font-semibold">
                  <span>Active Service Requests</span>
                  <span className="text-tertiary">{stats.maintenance} Open Tickets</span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div className="bg-tertiary h-full w-[35%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant/30 flex justify-between items-center text-xs text-on-surface-variant">
            <span>Server Database: SQLite</span>
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
