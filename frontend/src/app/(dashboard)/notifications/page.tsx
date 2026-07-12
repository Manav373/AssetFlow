"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { useWebsockets } from "@/hooks/useWebsockets";

type NotificationType = "alert" | "approval" | "booking" | "asset";

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  time: string;
  message: string;
  refLabel: string;
  refValue: string;
  bgClass: string;
  iconClass: string;
  icon: string;
  isRead: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"all" | "alert" | "approval" | "booking">("all");

  const loadData = useCallback(async () => {
    try {
      const assetsRes = await apiFetch("/assets?limit=100");
      const bookingsRes = await apiFetch("/bookings");
      const transfersRes = await apiFetch("/transfers");
      const maintenanceRes = await apiFetch("/maintenance");

      const list: NotificationItem[] = [];

      // Allocations -> asset updates
      const totalAssets = assetsRes.data || [];
      totalAssets.forEach((asset: any) => {
        (asset.allocations || []).forEach((alloc: any) => {
          list.push({
            id: `alloc-${alloc.id}`,
            type: "asset",
            title: `Asset Allocated: ${asset.name}`,
            time: new Date(alloc.allocationDate).toLocaleDateString(),
            message: `Asset ${asset.name} (${asset.assetTag}) was checked out to ${alloc.allocatedTo?.firstName} ${alloc.allocatedTo?.lastName}. Expected return: ${alloc.expectedReturnDate ? new Date(alloc.expectedReturnDate).toLocaleDateString() : 'N/A'}.`,
            refLabel: "Holder ID",
            refValue: alloc.allocatedTo?.employeeId || "Staff",
            bgClass: "bg-primary/10 text-primary border border-primary/20",
            iconClass: "assignment_ind",
            icon: "assignment_ind",
            isRead: false,
          });
        });
      });

      // Bookings -> scheduling
      bookingsRes.forEach((b: any) => {
        list.push({
          id: `book-${b.id}`,
          type: "booking",
          title: `Booking Confirmed: ${b.asset?.name || "Facility"}`,
          time: new Date(b.startTime).toLocaleDateString(),
          message: `Shared resource booking approved for ${b.bookedBy?.firstName} ${b.bookedBy?.lastName}. Slot scheduled from ${new Date(b.startTime).getHours()}:00 to ${new Date(b.endTime).getHours()}:00.`,
          refLabel: "Status",
          refValue: b.status,
          bgClass: "bg-surface-container-highest border border-outline-variant text-on-surface",
          iconClass: "event_available",
          icon: "event_available",
          isRead: b.status === "CANCELLED",
        });
      });

      // Maintenance -> alerts/approvals
      maintenanceRes.forEach((m: any) => {
        const isUrgent = m.priority === "Critical" || m.priority === "High";
        list.push({
          id: `maint-${m.id}`,
          type: isUrgent ? "alert" : "approval",
          title: `${m.priority} Priority Ticket: ${m.title}`,
          time: new Date(m.createdAt || new Date()).toLocaleDateString(),
          message: `Maintenance request raised by ${m.requestedBy?.firstName || 'Staff'} for ${m.asset?.name}. Ticket details: "${m.description}".`,
          refLabel: "State",
          refValue: m.status.replace("_", " "),
          bgClass: isUrgent ? "bg-error/10 text-error border border-error/20" : "bg-tertiary/10 text-tertiary border border-tertiary/20",
          iconClass: isUrgent ? "warning" : "build",
          icon: isUrgent ? "warning" : "build",
          isRead: m.status === "RESOLVED",
        });
      });

      // Transfers -> approval stages
      transfersRes.forEach((t: any) => {
        list.push({
          id: `transfer-${t.id}`,
          type: "approval",
          title: `Transfer Status: ${t.status.replace("_", " ")}`,
          time: new Date(t.createdAt || new Date()).toLocaleDateString(),
          message: `Department transfer requested for asset ${t.asset?.name} (${t.asset?.assetTag}) to department ${t.targetDept?.name || "Target"}.`,
          refLabel: "Transfer ID",
          refValue: t.id.slice(0, 8),
          bgClass: "bg-primary/10 text-primary border border-primary/20",
          iconClass: "swap_horiz",
          icon: "swap_horiz",
          isRead: t.status === "TRANSFERRED" || t.status === "CANCELLED",
        });
      });

      // Sort by id or timestamp descending (simulated by ordering logs)
      setNotifications(list.sort((a, b) => b.id.localeCompare(a.id)));
    } catch (err) {
      console.error("Error loading activities stream:", err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // WebSocket support
  useWebsockets({
    onDashboardRefresh: () => {
      loadData();
    },
  });

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === "all") return true;
      return n.type === filter;
    });
  }, [notifications, filter]);

  const alertsCount = useMemo(() => {
    return notifications.filter((n) => n.type === "alert" && !n.isRead).length;
  }, [notifications]);

  const approvalsCount = useMemo(() => {
    return notifications.filter((n) => n.type === "approval" && !n.isRead).length;
  }, [notifications]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-hanken font-bold text-3xl tracking-tight text-on-surface">Activity Feed</h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Real-time operational updates across your enterprise fleet and infrastructure.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant self-start md:self-auto bg-surface">
          {(["all", "alert", "approval", "booking"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                filter === type
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50"
              }`}
            >
              {type === "all" ? "All" : type + "s"}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          onClick={() => setFilter("alert")}
          className="glass-card p-4 rounded-xl flex flex-col justify-between group cursor-pointer hover:border-error transition-all bg-surface"
        >
          <div className="flex justify-between items-start">
            <span className="text-on-surface-variant text-[10px] font-mono uppercase tracking-wider">Urgent Alerts</span>
            <span className="material-symbols-outlined text-error text-xl animate-pulse">error</span>
          </div>
          <div className="mt-6">
            <div className="text-3xl font-bold text-error">{alertsCount.toString().padStart(2, "0")}</div>
            <div className="text-on-surface-variant text-xs mt-1">Action Required</div>
          </div>
        </div>

        <div
          onClick={() => setFilter("approval")}
          className="glass-card p-4 rounded-xl flex flex-col justify-between group cursor-pointer hover:border-tertiary transition-all bg-surface"
        >
          <div className="flex justify-between items-start">
            <span className="text-on-surface-variant text-[10px] font-mono uppercase tracking-wider">Pending Approvals</span>
            <span className="material-symbols-outlined text-tertiary text-xl">pending_actions</span>
          </div>
          <div className="mt-6">
            <div className="text-3xl font-bold text-tertiary">{approvalsCount.toString().padStart(2, "0")}</div>
            <div className="text-on-surface-variant text-xs mt-1">Operational Tasks</div>
          </div>
        </div>

        <div className="md:col-span-2 glass-card p-4 rounded-xl relative overflow-hidden group cursor-pointer hover:border-primary transition-all bg-surface">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant text-[10px] font-mono uppercase tracking-wider">Operational Load</span>
              <span className="material-symbols-outlined text-primary text-xl">insights</span>
            </div>
            <div className="flex items-end gap-6 mt-4">
              <div>
                <div className="text-3xl font-bold text-primary">
                  {Math.round(((notifications.length - notifications.filter(n => n.isRead).length) / (notifications.length || 1)) * 100)}%
                </div>
                <div className="text-on-surface-variant text-xs mt-1">Unread Alerts Ratio</div>
              </div>
              <div className="flex-1 h-12 flex items-end gap-1 pb-1">
                <div className="w-full bg-primary/20 h-2/3 rounded-t-sm animate-pulse"></div>
                <div className="w-full bg-primary/20 h-1/2 rounded-t-sm"></div>
                <div className="w-full bg-primary/40 h-3/4 rounded-t-sm animate-pulse"></div>
                <div className="w-full bg-primary h-full rounded-t-sm"></div>
                <div className="w-full bg-primary/60 h-2/3 rounded-t-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity List Container */}
      <div className="glass-card rounded-xl overflow-hidden shadow-lg bg-surface">
        <div className="bg-surface-container-high/50 border-b border-outline-variant px-6 py-4 flex justify-between items-center">
          <h3 className="text-xs font-mono text-on-surface font-bold tracking-widest">RECENT UPDATES</h3>
          <button
            onClick={markAllAsRead}
            className="text-primary text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            Mark all as read
          </button>
        </div>

        <div className="divide-y divide-outline-variant/30">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => toggleRead(n.id)}
              className={`p-5 flex items-start gap-4 hover:bg-surface-container-high/20 transition-all cursor-pointer ${
                n.isRead ? "opacity-60" : "font-semibold"
              }`}
            >
              <div className={`w-9 h-9 rounded-lg ${n.bgClass} flex items-center justify-center shrink-0`}>
                <span className="material-symbols-outlined text-base">{n.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <h4 className="text-sm text-on-surface truncate">{n.title}</h4>
                  <span className="text-[10px] text-on-surface-variant/60 font-mono shrink-0">{n.time}</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed font-normal">
                  {n.message}
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="bg-surface-container border border-outline-variant px-2 py-0.5 rounded text-[9px] font-mono text-on-surface-variant">
                    {n.refLabel}: {n.refValue}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {filteredNotifications.length === 0 && (
            <div className="p-8 text-center text-xs text-on-surface-variant italic">
              No updates in this filter scope.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
