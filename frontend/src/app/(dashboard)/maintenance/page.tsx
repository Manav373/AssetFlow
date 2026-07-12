"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { apiFetch } from "@/lib/api";
import { useWebsockets } from "@/hooks/useWebsockets";

// --- Types ---
type TicketStatus =
  | "Raised"
  | "Pending Approval"
  | "Approved"
  | "Technician Assigned"
  | "In Progress"
  | "Resolved";

interface MaintenanceTicket {
  id: string;
  title: string;
  asset: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  raisedBy: string;
  assignedTech?: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
}

interface Technician {
  id: string;
  name: string;
  specialty: string;
  available: boolean;
}

// --- Status mappings ---
const STATUSES: TicketStatus[] = [
  "Raised",
  "Pending Approval",
  "Approved",
  "Technician Assigned",
  "In Progress",
  "Resolved",
];

const STATUS_CONFIG: Record<TicketStatus, { icon: string; color: string; bg: string }> = {
  Raised: { icon: "report", color: "text-warning", bg: "bg-warning/10" },
  "Pending Approval": { icon: "hourglass_top", color: "text-info", bg: "bg-info/10" },
  Approved: { icon: "check_circle", color: "text-success", bg: "bg-success/10" },
  "Technician Assigned": { icon: "engineering", color: "text-primary", bg: "bg-primary/10" },
  "In Progress": { icon: "autorenew", color: "text-tertiary", bg: "bg-tertiary/10" },
  Resolved: { icon: "task_alt", color: "text-success", bg: "bg-success/10" },
};

const PRIORITY_STYLES: Record<MaintenanceTicket["priority"], { bg: string; text: string }> = {
  Low: { bg: "bg-surface-container-high", text: "text-on-surface-variant" },
  Medium: { bg: "bg-info/10", text: "text-info" },
  High: { bg: "bg-warning/10", text: "text-warning" },
  Critical: { bg: "bg-error/15", text: "text-error" },
};

const mapStatusToFront = (status: string): TicketStatus => {
  if (status === "RAISED") return "Raised";
  if (status === "PENDING_APPROVAL") return "Pending Approval";
  if (status === "APPROVED") return "Approved";
  if (status === "TECHNICIAN_ASSIGNED") return "Technician Assigned";
  if (status === "IN_PROGRESS") return "In Progress";
  if (status === "RESOLVED") return "Resolved";
  return "Raised";
};

const mapStatusToBack = (status: TicketStatus): string => {
  if (status === "Raised") return "RAISED";
  if (status === "Pending Approval") return "PENDING_APPROVAL";
  if (status === "Approved") return "APPROVED";
  if (status === "Technician Assigned") return "TECHNICIAN_ASSIGNED";
  if (status === "In Progress") return "IN_PROGRESS";
  if (status === "Resolved") return "RESOLVED";
  return "RAISED";
};

export default function MaintenancePage() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [showTechModal, setShowTechModal] = useState(false);
  const [pendingTicketId, setPendingTicketId] = useState<string | null>(null);
  const [hoveredCol, setHoveredCol] = useState<TicketStatus | null>(null);

  const loadData = useCallback(async () => {
    try {
      // 1. Fetch Maintenance tickets
      const ticketData = await apiFetch("/maintenance");
      const mappedTickets = ticketData.map((t: any) => ({
        id: t.id,
        title: t.title,
        asset: t.asset ? `${t.asset.name} (${t.asset.assetTag})` : "Unknown Asset",
        priority: (t.priority || "Medium") as any,
        raisedBy: t.requestedBy ? `${t.requestedBy.firstName} ${t.requestedBy.lastName}` : "Staff",
        assignedTech: t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : undefined,
        description: t.description,
        status: mapStatusToFront(t.status),
        createdAt: t.createdAt ? new Date(t.createdAt).toISOString().split("T")[0] : "",
      }));
      setTickets(mappedTickets);

      // 2. Fetch Users to display as technicians (admins or managers or engineers)
      const usersData = await apiFetch("/auth/users");
      const techs = usersData.map((u: any) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        specialty: u.role === "ADMIN" ? "Lead Tech" : "General Support",
        available: u.isActive,
      }));
      setTechnicians(techs);
    } catch (err) {
      console.error("Error loading maintenance data:", err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time synchronization
  useWebsockets({
    onDashboardRefresh: () => {
      loadData();
    },
  });

  const getTicketsByStatus = (status: TicketStatus) =>
    tickets.filter((t) => t.status === status);

  const handleDragStart = (e: React.DragEvent, ticketId: string) => {
    setDraggedId(ticketId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, status: TicketStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setHoveredCol(status);
  };

  const handleDragLeave = () => {
    setHoveredCol(null);
  };

  const syncTicketStatus = async (ticketId: string, status: TicketStatus, techId?: string) => {
    try {
      const payload: Record<string, string> = {
        status: mapStatusToBack(status),
      };
      if (techId) {
        payload.assignedToId = techId;
      }
      await apiFetch(`/maintenance/${ticketId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      loadData();
    } catch (err) {
      console.error("Error updating ticket status:", err);
    }
  };

  const handleDrop = (e: React.DragEvent, newStatus: TicketStatus) => {
    e.preventDefault();
    setHoveredCol(null);
    if (!draggedId) return;

    if (newStatus === "Technician Assigned") {
      setPendingTicketId(draggedId);
      setShowTechModal(true);
    } else {
      syncTicketStatus(draggedId, newStatus);
    }
    setDraggedId(null);
  };

  const handleAssignTechnician = (techId: string) => {
    if (pendingTicketId) {
      syncTicketStatus(pendingTicketId, "Technician Assigned", techId);
      setPendingTicketId(null);
    }
    setShowTechModal(false);
  };

  const handleCardAction = (ticketId: string, newStatus: TicketStatus) => {
    if (newStatus === "Technician Assigned") {
      setPendingTicketId(ticketId);
      setShowTechModal(true);
    } else {
      syncTicketStatus(ticketId, newStatus);
    }
  };

  const getNextStatus = (current: TicketStatus): TicketStatus | null => {
    const idx = STATUSES.indexOf(current);
    return idx < STATUSES.length - 1 ? STATUSES[idx + 1] : null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-hanken font-bold text-3xl tracking-tight text-on-surface">
            Maintenance Pipeline
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Track service tickets through the maintenance lifecycle.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-on-surface-variant font-mono flex items-center gap-2">
            <span className="w-2 h-2 bg-info rounded-full animate-pulse" />
            {tickets.length} tickets
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
        {STATUSES.map((status) => {
          const config = STATUS_CONFIG[status];
          const colTickets = getTicketsByStatus(status);
          const isHovered = hoveredCol === status;

          return (
            <div
              key={status}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
              className={`flex-shrink-0 w-[260px] flex flex-col rounded-xl border transition-all duration-200 ${
                isHovered
                  ? "border-primary/40 bg-primary/[0.03]"
                  : "border-outline-variant/40 bg-surface-container/30"
              }`}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-outline-variant/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded ${config.bg} flex items-center justify-center`}>
                    <span
                      className={`material-symbols-outlined text-sm ${config.color}`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {config.icon}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    {status}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container-high px-1.5 py-0.5 rounded">
                  {colTickets.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-2 min-h-[120px]">
                <AnimatePresence>
                  {colTickets.map((ticket) => {
                    const pStyle = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.Medium;
                    const nextStatus = getNextStatus(ticket.status);

                    return (
                      <motion.div
                        key={ticket.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, ticket.id)}
                        className={`glass-card rounded-lg p-3 cursor-grab active:cursor-grabbing space-y-2 select-none bg-surface transition-shadow hover:shadow-lg ${
                          draggedId === ticket.id ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-semibold text-on-surface leading-tight">
                            {ticket.title}
                          </p>
                          <span
                            className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${pStyle.bg} ${pStyle.text}`}
                          >
                            {ticket.priority}
                          </span>
                        </div>

                        <p className="text-[10px] text-on-surface-variant font-mono">{ticket.asset}</p>

                        <p className="text-xs text-on-surface-variant line-clamp-2">
                          {ticket.description}
                        </p>

                        <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
                          <div className="flex items-center gap-1 text-[10px] text-on-surface-variant">
                            <span className="material-symbols-outlined text-xs">person</span>
                            {ticket.assignedTech || ticket.raisedBy}
                          </div>
                          <span className="text-[9px] font-mono text-on-surface-variant/60">
                            {ticket.createdAt}
                          </span>
                        </div>

                        {/* Quick Action */}
                        {nextStatus && (
                          <button
                            onClick={() => handleCardAction(ticket.id, nextStatus)}
                            className="w-full mt-1 bg-surface-container-high/50 hover:bg-surface-container-highest border border-outline-variant/30 rounded px-2 py-1 text-[10px] font-semibold text-on-surface-variant hover:text-primary transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-xs">arrow_forward</span>
                            Move to {nextStatus}
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {colTickets.length === 0 && (
                  <div className="flex items-center justify-center h-20 text-on-surface-variant/30">
                    <span className="text-[10px] font-mono uppercase tracking-widest">Empty</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Assign Technician Modal */}
      <AnimatePresence>
        {showTechModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => {
              setShowTechModal(false);
              setPendingTicketId(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl bg-surface"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-hanken font-bold text-xl text-on-surface">Assign Technician</h3>
                <button
                  onClick={() => {
                    setShowTechModal(false);
                    setPendingTicketId(null);
                  }}
                  className="text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <p className="text-sm text-on-surface-variant">
                Select a technician to assign to this maintenance ticket.
              </p>

              <div className="space-y-2">
                {technicians.map((tech) => (
                  <button
                    key={tech.id}
                    disabled={!tech.available}
                    onClick={() => handleAssignTechnician(tech.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-outline-variant/30 hover:border-primary/40 hover:bg-primary/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-outline-variant/30 disabled:hover:bg-transparent text-left cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary">engineering</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-on-surface">{tech.name}</p>
                      <p className="text-xs text-on-surface-variant">{tech.specialty}</p>
                    </div>
                    <div>
                      {tech.available ? (
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-secondary/10 text-secondary">
                          Available
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                          Busy
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
