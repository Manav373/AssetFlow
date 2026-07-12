/**
 * @module useWebsockets
 * @description Custom hook to connect to the NestJS Socket.IO server for real-time events.
 * @authors Developer 4
 * @status In-Progress
 * @collaboration Listens to backend Socket.IO gateway events (notification:new, dashboard:refresh)
 */

"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:3001";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
}

interface UseWebsocketsOptions {
  onNotification?: (notification: Notification) => void;
  onDashboardRefresh?: () => void;
  enabled?: boolean;
}

export function useWebsockets({
  onNotification,
  onDashboardRefresh,
  enabled = true,
}: UseWebsocketsOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const onNotificationRef = useRef(onNotification);
  const onDashboardRefreshRef = useRef(onDashboardRefresh);

  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    onDashboardRefreshRef.current = onDashboardRefresh;
  }, [onDashboardRefresh]);

  useEffect(() => {
    if (!enabled) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("[WebSocket] Connected to", SOCKET_URL);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("[WebSocket] Disconnected");
    });

    socket.on("connect_error", () => {
      setIsConnected(false);
      // Silent fail — backend may not be running yet
    });

    // --- START: Dev 4 — Real-time notification listener ---
    socket.on("notification:new", (data: Omit<Notification, "id" | "timestamp">) => {
      const notification: Notification = {
        ...data,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };
      onNotificationRef.current?.(notification);
    });
    // --- END: Dev 4 — Real-time notification listener ---

    // --- START: Dev 4 — Silent dashboard refresh trigger ---
    socket.on("dashboard:refresh", () => {
      onDashboardRefreshRef.current?.();
    });
    // --- END: Dev 4 — Silent dashboard refresh trigger ---

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [enabled]);

  const emit = useCallback((event: string, data?: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  return { isConnected, emit };
}
