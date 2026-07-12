"use client";

import React, { useState } from "react";

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

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    type: "approval",
    title: "Maintenance Approved: Generator Unit-B4",
    time: "2m ago",
    message: "Logistics supervisor Marcus Chen approved the emergency radiator replacement scheduled for 14:00 PM today.",
    refLabel: "REF",
    refValue: "REF-99230",
    bgClass: "bg-tertiary/10 text-tertiary",
    iconClass: "build",
    icon: "build",
    isRead: false,
  },
  {
    id: "2",
    type: "approval",
    title: "New Asset Assignment",
    time: "45m ago",
    message: "Ford F-150 Fleet #42 has been assigned to Sarah Jenkins for the Northern Perimeter inspection.",
    refLabel: "Zone",
    refValue: "Zone A-North",
    bgClass: "bg-primary/10 text-primary",
    iconClass: "assignment_ind",
    icon: "assignment_ind",
    isRead: false,
  },
  {
    id: "3",
    type: "booking",
    title: "Conference Room C Booking Confirmed",
    time: "2h ago",
    message: "Weekly Stakeholder Sync booked by Enterprise Admin. Recurring every Tuesday until Sept 30.",
    refLabel: "Time",
    refValue: "10:00 - 11:30",
    bgClass: "bg-surface-container-highest border border-outline-variant text-on-surface",
    iconClass: "event_available",
    icon: "event_available",
    isRead: true,
  },
  {
    id: "4",
    type: "alert",
    title: "Critical: Telemetry Offline",
    time: "5h ago",
    message: "Heartbeat signal lost for Drone Unit Echo-1. Last known position: 34.0522° N, 118.2437° W.",
    refLabel: "Alert",
    refValue: "CRITICAL",
    bgClass: "bg-error/10 text-error",
    iconClass: "warning",
    icon: "warning",
    isRead: false,
  },
  {
    id: "5",
    type: "asset",
    title: "New Asset Inbound: HP Workstation Z8",
    time: "1d ago",
    message: "Shipment received and verified at Central Dock. Ready for tagging and inventory registration.",
    refLabel: "PO",
    refValue: "PO #88210",
    bgClass: "bg-primary/10 text-primary",
    iconClass: "inventory_2",
    icon: "inventory_2",
    isRead: true,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "alert" | "approval" | "booking">("all");

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    return n.type === filter;
  });

  const alertsCount = notifications.filter((n) => n.type === "alert" && !n.isRead).length;
  const approvalsCount = notifications.filter((n) => n.type === "approval" && !n.isRead).length;

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
        <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant self-start md:self-auto">
          {(["all", "alert", "approval", "booking"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                filter === type
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
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
          className="glass-card p-4 rounded-xl flex flex-col justify-between group cursor-pointer hover:border-error transition-all"
        >
          <div className="flex justify-between items-start">
            <span className="text-on-surface-variant text-[10px] font-mono uppercase tracking-wider">Urgent Alerts</span>
            <span className="material-symbols-outlined text-error text-xl">error</span>
          </div>
          <div className="mt-6">
            <div className="text-3xl font-bold text-error">{alertsCount.toString().padStart(2, "0")}</div>
            <div className="text-on-surface-variant text-xs mt-1">Action Required</div>
          </div>
        </div>

        <div
          onClick={() => setFilter("approval")}
          className="glass-card p-4 rounded-xl flex flex-col justify-between group cursor-pointer hover:border-tertiary transition-all"
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

        <div className="md:col-span-2 glass-card p-4 rounded-xl relative overflow-hidden group cursor-pointer hover:border-primary transition-all">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant text-[10px] font-mono uppercase tracking-wider">Today's Utilization</span>
              <span className="material-symbols-outlined text-primary text-xl">insights</span>
            </div>
            <div className="flex items-end gap-6 mt-4">
              <div>
                <div className="text-3xl font-bold text-primary">84%</div>
                <div className="text-on-surface-variant text-xs mt-1">Average Capacity</div>
              </div>
              <div className="flex-1 h-12 flex items-end gap-1 pb-1">
                <div className="w-full bg-primary/20 h-2/3 rounded-t-sm"></div>
                <div className="w-full bg-primary/20 h-1/2 rounded-t-sm"></div>
                <div className="w-full bg-primary/40 h-3/4 rounded-t-sm"></div>
                <div className="w-full bg-primary h-full rounded-t-sm"></div>
                <div className="w-full bg-primary/60 h-2/3 rounded-t-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity List Container */}
      <div className="glass-card rounded-xl overflow-hidden shadow-lg">
        <div className="bg-surface-container-high/50 border-b border-outline-variant px-6 py-4 flex justify-between items-center">
          <h3 className="text-xs font-mono text-on-surface font-bold tracking-widest">RECENT UPDATES</h3>
          <button
            onClick={markAllAsRead}
            className="text-primary text-xs font-semibold hover:underline flex items-center gap-1"
          >
            Mark all as read <span className="material-symbols-outlined text-sm">done_all</span>
          </button>
        </div>

        <div className="divide-y divide-outline-variant/30">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl opacity-40 mb-2">notifications_off</span>
              <p className="text-sm">No recent activities match this filter.</p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleRead(item.id)}
                className={`activity-row p-6 flex gap-4 transition-all items-start cursor-pointer ${
                  !item.isRead ? "bg-primary/5" : ""
                } ${item.type === "alert" && !item.isRead ? "bg-error/5" : ""}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.bgClass}`}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`font-semibold text-sm ${!item.isRead ? "text-on-surface font-bold" : "text-on-surface/80"}`}>
                      {item.title}
                    </h4>
                    <span className="text-on-surface-variant font-mono text-xs shrink-0 ml-2">{item.time}</span>
                  </div>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{item.message}</p>
                  
                  <div className="pt-2 flex items-center gap-4">
                    <span className={`px-2 py-0.5 font-mono text-[9px] rounded uppercase tracking-wider ${
                      item.type === "alert"
                        ? "bg-error-container text-error"
                        : item.type === "approval"
                        ? "bg-tertiary-container/20 text-tertiary"
                        : "bg-surface-variant text-on-surface-variant"
                    }`}>
                      {item.type}
                    </span>
                    <span className="text-on-surface-variant text-xs flex items-center gap-1 font-mono">
                      <span className="material-symbols-outlined text-sm">
                        {item.type === "alert" ? "error" : "receipt_long"}
                      </span>
                      {item.refLabel}: {item.refValue}
                    </span>

                    {item.type === "alert" && !item.isRead && (
                      <button
                        className="bg-error text-on-error px-3 py-1 rounded text-xs font-semibold hover:brightness-110 transition-all ml-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNotifications((prev) =>
                            prev.map((n) =>
                              n.id === item.id
                                ? {
                                    ...n,
                                    message: "Emergency recovery protocol initiated successfully. Drone Unit Echo-1 is returning to base.",
                                    isRead: true,
                                  }
                                : n
                            )
                          );
                        }}
                      >
                        Initiate Recovery
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More */}
        <div className="bg-surface-container-low/30 p-6 flex justify-center border-t border-outline-variant">
          <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-semibold text-xs uppercase tracking-wider">
            Load Older Activities
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </button>
        </div>
      </div>
    </div>
  );
}
