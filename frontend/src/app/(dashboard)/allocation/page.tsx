<<<<<<< HEAD
"use client";

import React from "react";
import ComingSoon from "@/components/shared/ComingSoon";

export default function AllocationPage() {
  return (
    <div className="py-12">
      <ComingSoon
        title="Asset Allocation & Transfer"
        description="Allocate inventory items to personnel, trigger multi-stage department transfer approvals, and process check-in returns."
        icon="assignment_ind"
      />
=======
/**
 * @module AssetAllocation
 * @description Handover form with conflict rule checking and transfer requests panel.
 * @authors Developer 4
 * @status In-Progress
 * @collaboration Frontend team consumes POST /api/allocations payload
 */

"use client";

import React, { useState, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";

// --- Mock Data ---
interface Asset {
  id: string;
  name: string;
  serial: string;
  currentHolder?: string;
  department?: string;
}

interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
}

interface TransferRequest {
  id: string;
  assetName: string;
  fromEmployee: string;
  toEmployee: string;
  status: "Pending Dept Head" | "Pending Manager" | "Approved" | "Rejected";
  requestDate: string;
  notes: string;
}

const MOCK_ASSETS: Asset[] = [
  { id: "a1", name: "Laptop AF-0196", serial: "S/N: 10234-A", currentHolder: "Priya Shah", department: "IT" },
  { id: "a2", name: "Projector AF-0062", serial: "S/N: 20451-B" },
  { id: "a3", name: "Vehicle AF-0311", serial: "S/N: 33102-C", currentHolder: "Raj Patel", department: "Logistics" },
  { id: "a4", name: "Monitor AF-0089", serial: "S/N: 44892-D" },
  { id: "a5", name: "Printer AF-0127", serial: "S/N: 55713-E" },
  { id: "a6", name: "Server NV-12", serial: "S/N: 11043-L", currentHolder: "Vikram Desai", department: "R&D" },
];

const MOCK_EMPLOYEES: Employee[] = [
  { id: "e1", name: "Priya Shah", department: "IT", role: "Engineer" },
  { id: "e2", name: "Arjun Mehta", department: "R&D", role: "Lead" },
  { id: "e3", name: "Neha Kapoor", department: "Admin", role: "Coordinator" },
  { id: "e4", name: "Raj Patel", department: "Logistics", role: "Supervisor" },
  { id: "e5", name: "Simran Kaur", department: "Quality", role: "Analyst" },
];

const MOCK_TRANSFERS: TransferRequest[] = [
  {
    id: "t1",
    assetName: "Laptop AF-0196",
    fromEmployee: "Priya Shah",
    toEmployee: "Arjun Mehta",
    status: "Pending Dept Head",
    requestDate: "2026-07-10",
    notes: "Cross-department transfer for R&D project",
  },
  {
    id: "t2",
    assetName: "Vehicle AF-0311",
    fromEmployee: "Raj Patel",
    toEmployee: "Neha Kapoor",
    status: "Pending Manager",
    requestDate: "2026-07-09",
    notes: "Temporary reassignment for admin logistics",
  },
  {
    id: "t3",
    assetName: "Tablet AF-0044",
    fromEmployee: "Vikram Desai",
    toEmployee: "Simran Kaur",
    status: "Approved",
    requestDate: "2026-07-05",
    notes: "QC site visits",
  },
  {
    id: "t4",
    assetName: "Camera AF-0093",
    fromEmployee: "Arjun Mehta",
    toEmployee: "Raj Patel",
    status: "Rejected",
    requestDate: "2026-07-03",
    notes: "Not available — in active use",
  },
];

const STATUS_STYLES: Record<TransferRequest["status"], { bg: string; text: string; icon: string }> = {
  "Pending Dept Head": { bg: "bg-tertiary/10", text: "text-tertiary", icon: "hourglass_top" },
  "Pending Manager": { bg: "bg-primary/10", text: "text-primary", icon: "pending" },
  Approved: { bg: "bg-secondary/10", text: "text-secondary", icon: "check_circle" },
  Rejected: { bg: "bg-error/10", text: "text-error", icon: "cancel" },
};

export default function AllocationPage() {
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [notes, setNotes] = useState("");
  const [transfers, setTransfers] = useState<TransferRequest[]>(MOCK_TRANSFERS);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const selectedAsset = useMemo(
    () => MOCK_ASSETS.find((a) => a.id === selectedAssetId),
    [selectedAssetId]
  );

  const isConflict = selectedAsset?.currentHolder != null;

  const handleSubmitAllocation = () => {
    if (!selectedAssetId || !selectedEmployeeId || !returnDate) return;
    if (isConflict) return;

    const asset = MOCK_ASSETS.find((a) => a.id === selectedAssetId);
    const emp = MOCK_EMPLOYEES.find((e) => e.id === selectedEmployeeId);
    setSuccessMessage(
      `✓ ${asset?.name} successfully allocated to ${emp?.name}. Return expected by ${returnDate}.`
    );
    setSelectedAssetId("");
    setSelectedEmployeeId("");
    setReturnDate("");
    setNotes("");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handleRequestTransfer = () => {
    if (!selectedAsset || !selectedEmployeeId) return;
    const emp = MOCK_EMPLOYEES.find((e) => e.id === selectedEmployeeId);
    const newTransfer: TransferRequest = {
      id: `t${Date.now()}`,
      assetName: selectedAsset.name,
      fromEmployee: selectedAsset.currentHolder!,
      toEmployee: emp?.name || "Unknown",
      status: "Pending Dept Head",
      requestDate: new Date().toISOString().split("T")[0],
      notes: notes || "Transfer request submitted",
    };
    setTransfers((prev) => [newTransfer, ...prev]);
    setShowTransferModal(false);
    setSelectedAssetId("");
    setSelectedEmployeeId("");
    setNotes("");
    setSuccessMessage("✓ Transfer request submitted successfully.");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handleTransferAction = (id: string, action: "Approved" | "Rejected") => {
    setTransfers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: action } : t))
    );
  };

  // Simulated logged-in user role for Approve/Reject visibility
  const userRole = "Manager";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="font-hanken font-bold text-3xl tracking-tight text-on-surface">
          Asset Allocation & Transfer
        </h2>
        <p className="text-on-surface-variant text-sm mt-1">
          Allocate assets to personnel, manage handovers, and process transfer requests.
        </p>
      </div>

      {/* Success Banner */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-secondary/10 border border-secondary/30 rounded-xl p-4 flex items-center gap-3 text-secondary"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              task_alt
            </span>
            <span className="text-sm font-semibold">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Handover Form — Left */}
        <div className="lg:col-span-2 glass-card rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-outline-variant pb-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-lg">assignment_ind</span>
            </div>
            <h3 className="font-semibold text-on-surface">New Handover</h3>
          </div>

          {/* Asset Dropdown */}
          <div className="space-y-1.5">
            <label className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
              Select Asset
            </label>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="">Choose an asset…</option>
              {MOCK_ASSETS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.serial}
                </option>
              ))}
            </select>
          </div>

          {/* Conflict Warning Card */}
          <AnimatePresence>
            {isConflict && selectedAsset && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-error/8 border border-error/25 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-error">
                    <span className="material-symbols-outlined text-lg">warning</span>
                    <span className="text-sm font-semibold">Allocation Conflict</span>
                  </div>
                  <p className="text-on-surface-variant text-xs leading-relaxed">
                    This asset is currently assigned to{" "}
                    <span className="text-on-surface font-semibold">{selectedAsset.currentHolder}</span>{" "}
                    ({selectedAsset.department} Dept). Direct allocation is blocked.
                  </p>
                  <button
                    onClick={() => setShowTransferModal(true)}
                    className="bg-tertiary/15 text-tertiary border border-tertiary/25 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-tertiary/25 transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">swap_horiz</span>
                    Request Transfer Instead
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Employee Dropdown */}
          <div className="space-y-1.5">
            <label className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
              Select Employee
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="">Choose an employee…</option>
              {MOCK_EMPLOYEES.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.department} ({emp.role})
                </option>
              ))}
            </select>
          </div>

          {/* Return Date */}
          <div className="space-y-1.5">
            <label className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
              Expected Return Date
            </label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional notes about this allocation…"
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all resize-none placeholder:text-on-surface-variant/50"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmitAllocation}
            disabled={!selectedAssetId || !selectedEmployeeId || !returnDate || isConflict}
            className="w-full bg-primary text-on-primary font-bold px-4 py-3 rounded-lg text-xs uppercase tracking-wide hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">check</span>
            Submit Allocation
          </button>
        </div>

        {/* Transfer Requests Panel — Right */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-tertiary/10 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary text-lg">swap_horiz</span>
              </div>
              <h3 className="font-semibold text-on-surface">Transfer Requests</h3>
            </div>
            <span className="text-on-surface-variant text-xs font-mono">
              {transfers.length} total
            </span>
          </div>

          <div className="space-y-3">
            {transfers.map((tr, i) => {
              const style = STATUS_STYLES[tr.status];
              const canAct =
                (tr.status === "Pending Dept Head" || tr.status === "Pending Manager") &&
                (userRole === "Manager" || userRole === "Dept Head");
              return (
                <motion.div
                  key={tr.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg ${style.bg} flex items-center justify-center`}>
                        <span
                          className={`material-symbols-outlined ${style.text}`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {style.icon}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{tr.assetName}</p>
                        <p className="text-xs text-on-surface-variant">
                          {tr.fromEmployee}{" "}
                          <span className="material-symbols-outlined text-[10px] align-middle mx-1">
                            arrow_forward
                          </span>{" "}
                          {tr.toEmployee}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${style.bg} ${style.text}`}
                      >
                        {tr.status}
                      </span>
                      <p className="text-[10px] text-on-surface-variant font-mono mt-1">
                        {tr.requestDate}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-on-surface-variant border-t border-outline-variant/30 pt-2">
                    {tr.notes}
                  </p>

                  {canAct && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleTransferAction(tr.id, "Approved")}
                        className="flex-1 bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase hover:bg-secondary/20 transition-all flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                        Approve
                      </button>
                      <button
                        onClick={() => handleTransferAction(tr.id, "Rejected")}
                        className="flex-1 bg-error/10 text-error border border-error/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase hover:bg-error/20 transition-all flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                        Reject
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transfer Request Modal */}
      <AnimatePresence>
        {showTransferModal && selectedAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowTransferModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-hanken font-bold text-xl text-on-surface">Transfer Request</h3>
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="bg-surface-container border border-outline-variant rounded-lg p-3 space-y-1">
                <p className="text-xs text-on-surface-variant uppercase font-mono tracking-wider">
                  Asset
                </p>
                <p className="text-sm font-semibold text-on-surface">{selectedAsset.name}</p>
                <p className="text-xs text-on-surface-variant">
                  Currently held by: {selectedAsset.currentHolder}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                  Transfer To
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Choose recipient…</option>
                  {MOCK_EMPLOYEES.filter((e) => e.name !== selectedAsset.currentHolder).map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                  Reason / Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Reason for transfer…"
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all resize-none placeholder:text-on-surface-variant/50"
                />
              </div>

              <button
                onClick={handleRequestTransfer}
                disabled={!selectedEmployeeId}
                className="w-full bg-tertiary text-on-tertiary font-bold px-4 py-3 rounded-lg text-xs uppercase tracking-wide hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">send</span>
                Submit Transfer Request
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
>>>>>>> d52f8a1 (feat: implement Dev4 allocation, booking, maintenance, reports & socket.io)
    </div>
  );
}
