/**
 * @module NotificationToast
 * @description Slide-in alert popup for real-time Socket.IO notifications.
 * @authors Developer 4
 * @status In-Progress
 * @collaboration Receives events from useWebsockets hook (notification:new)
 */

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Notification } from "@/hooks/useWebsockets";

interface NotificationToastProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const ICON_MAP: Record<Notification["type"], { icon: string; color: string; bg: string }> = {
  info: { icon: "info", color: "text-primary", bg: "bg-primary/10" },
  success: { icon: "check_circle", color: "text-secondary", bg: "bg-secondary/10" },
  warning: { icon: "warning", color: "text-tertiary", bg: "bg-tertiary/10" },
  error: { icon: "error", color: "text-error", bg: "bg-error/10" },
};

function SingleToast({
  notification,
  onDismiss,
}: {
  notification: Notification;
  onDismiss: (id: string) => void;
}) {
  const style = ICON_MAP[notification.type] || ICON_MAP.info;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 350 }}
      className="glass-card rounded-xl p-4 shadow-2xl max-w-sm w-full pointer-events-auto"
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg ${style.bg} flex items-center justify-center shrink-0`}>
          <span
            className={`material-symbols-outlined ${style.color}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {style.icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-on-surface truncate">{notification.title}</p>
          <p className="text-on-surface-variant text-xs mt-0.5 line-clamp-2">{notification.message}</p>
        </div>
        <button
          onClick={() => onDismiss(notification.id)}
          className="text-on-surface-variant hover:text-on-surface transition-colors shrink-0 p-0.5"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>
    </motion.div>
  );
}

export default function NotificationToast({ notifications, onDismiss }: NotificationToastProps) {
  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => (
          <SingleToast key={n.id} notification={n} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// --- START: Dev 4 — Standalone toast manager hook ---
export function useNotificationToasts() {
  const [toasts, setToasts] = useState<Notification[]>([]);

  const addToast = useCallback((notification: Notification) => {
    setToasts((prev) => [...prev.slice(-4), notification]); // keep max 5
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, dismissToast };
}
// --- END: Dev 4 — Standalone toast manager hook ---
