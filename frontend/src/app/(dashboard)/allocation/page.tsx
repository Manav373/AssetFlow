"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { apiFetch } from "@/lib/api";
import { useWebsockets } from "@/hooks/useWebsockets";

// --- Types ---
interface Asset {
  id: string;
  name: string;
  serial: string;
  currentHolder?: string;
  currentHolderId?: string;
  departmentId?: string;
  departmentName?: string;
}

interface Employee {
  id: string;
  name: string;
  departmentId?: string;
  departmentName?: string;
  role: string;
}

interface TransferRequest {
  id: string;
  assetId: string;
  assetName: string;
  fromEmployee: string;
  toEmployee: string;
  status: string;
  requestDate: string;
  notes: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  REQUESTED: { bg: "bg-tertiary/10", text: "text-tertiary", icon: "hourglass_top" },
  DEPT_HEAD_APPROVED: { bg: "bg-primary/10", text: "text-primary", icon: "pending" },
  DEPT_HEAD_REJECTED: { bg: "bg-error/10", text: "text-error", icon: "cancel" },
  ASSET_MANAGER_APPROVED: { bg: "bg-secondary/10", text: "text-secondary", icon: "check_circle" },
  ASSET_MANAGER_REJECTED: { bg: "bg-error/10", text: "text-error", icon: "cancel" },
  TRANSFERRED: { bg: "bg-secondary/10", text: "text-secondary", icon: "check_circle" },
  CANCELLED: { bg: "bg-error/10", text: "text-error", icon: "cancel" },
};

const mapStatusToFront = (status: string) => {
  if (status === "REQUESTED") return "Pending Dept Head";
  if (status === "DEPT_HEAD_APPROVED") return "Pending Manager";
  if (status === "DEPT_HEAD_REJECTED") return "Rejected by Dept Head";
  if (status === "ASSET_MANAGER_APPROVED" || status === "TRANSFERRED") return "Approved";
  if (status === "ASSET_MANAGER_REJECTED") return "Rejected by Manager";
  if (status === "CANCELLED") return "Cancelled";
  return status;
};

export default function AllocationPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [notes, setNotes] = useState("");
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load current user profile to verify roles
  useEffect(() => {
    if (typeof window !== "undefined") {
      const uStr = localStorage.getItem("user");
      if (uStr) {
        try {
          setCurrentUser(JSON.parse(uStr));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      // 1. Fetch Assets
      const assetsData = await apiFetch("/assets?limit=100");
      setAssets(
        assetsData.data.map((a: any) => ({
          id: a.id,
          name: `${a.name} (${a.assetTag})`,
          serial: a.serialNumber ? `S/N: ${a.serialNumber}` : "No S/N",
          currentHolder: a.allocations && a.allocations.length > 0
            ? `${a.allocations[0].allocatedTo?.firstName} ${a.allocations[0].allocatedTo?.lastName}`
            : undefined,
          currentHolderId: a.allocations && a.allocations.length > 0
            ? a.allocations[0].allocatedTo?.id
            : undefined,
          departmentId: a.departmentId || undefined,
          departmentName: a.department?.name || undefined,
        }))
      );

      // 2. Fetch Employees (Users)
      const usersData = await apiFetch("/auth/users");
      setEmployees(
        usersData.map((u: any) => ({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          departmentId: u.department?.id,
          departmentName: u.department?.name,
          role: u.role,
        }))
      );

      // 3. Fetch Departments
      const deptsData = await apiFetch("/departments");
      setDepartments(deptsData);

      // 4. Fetch Transfers
      const transfersData = await apiFetch("/transfers");
      setTransfers(
        transfersData.map((t: any) => {
          // Find asset current holder from employee list if possible, or fallback
          return {
            id: t.id,
            assetId: t.assetId,
            assetName: t.asset ? `${t.asset.name} (${t.asset.assetTag})` : "Unknown Asset",
            fromEmployee: "Current Holder", // Fallback placeholder
            toEmployee: `${t.requestedBy?.firstName || ""} ${t.requestedBy?.lastName || ""}`,
            status: t.status,
            requestDate: t.createdAt ? new Date(t.createdAt).toISOString().split("T")[0] : "",
            notes: t.notes || `Reassign department transfer to ${t.targetDept?.name || "Target Department"}`,
          };
        })
      );
    } catch (err: any) {
      console.error("Error loading allocation data:", err);
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

  const selectedAsset = useMemo(
    () => assets.find((a) => a.id === selectedAssetId),
    [assets, selectedAssetId]
  );

  const isConflict = selectedAsset?.currentHolder != null;

  const handleSubmitAllocation = async () => {
    if (!selectedAssetId || !selectedEmployeeId || !returnDate) return;
    if (isConflict) return;

    setErrorMessage("");
    try {
      const asset = assets.find((a) => a.id === selectedAssetId);
      const emp = employees.find((e) => e.id === selectedEmployeeId);

      await apiFetch("/allocations", {
        method: "POST",
        body: JSON.stringify({
          assetId: selectedAssetId,
          allocatedToId: selectedEmployeeId,
          expectedReturnDate: new Date(returnDate).toISOString(),
        }),
      });

      setSuccessMessage(
        `✓ ${asset?.name} successfully allocated to ${emp?.name}. Return expected by ${returnDate}.`
      );
      setSelectedAssetId("");
      setSelectedEmployeeId("");
      setReturnDate("");
      setNotes("");
      setTimeout(() => setSuccessMessage(""), 4000);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit allocation.");
    }
  };

  const handleRequestTransfer = async () => {
    if (!selectedAsset || !selectedEmployeeId) return;
    const emp = employees.find((e) => e.id === selectedEmployeeId);
    if (!emp?.departmentId) {
      setErrorMessage("Recipient must be assigned to a department to request transfer.");
      return;
    }

    setErrorMessage("");
    try {
      await apiFetch("/transfers", {
        method: "POST",
        body: JSON.stringify({
          assetId: selectedAsset.id,
          targetDeptId: emp.departmentId,
        }),
      });

      setShowTransferModal(false);
      setSelectedAssetId("");
      setSelectedEmployeeId("");
      setNotes("");
      setSuccessMessage("✓ Transfer request submitted successfully.");
      setTimeout(() => setSuccessMessage(""), 4000);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to request transfer.");
    }
  };

  const handleTransferAction = async (id: string, currentStatus: string, action: "Approved" | "Rejected") => {
    setErrorMessage("");
    try {
      let endpoint = "";
      if (currentStatus === "REQUESTED") {
        endpoint = action === "Approved" ? "dept-approve" : "dept-reject";
      } else if (currentStatus === "DEPT_HEAD_APPROVED") {
        endpoint = action === "Approved" ? "manager-approve" : "manager-reject";
      }

      if (!endpoint) return;

      await apiFetch(`/transfers/${id}/${endpoint}`, {
        method: "PATCH",
      });

      setSuccessMessage(`✓ Transfer request successfully ${action.toLowerCase()}.`);
      setTimeout(() => setSuccessMessage(""), 4000);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to process transfer action.");
    }
  };

  const userRole = currentUser?.role; // ADMIN | ASSET_MANAGER | DEPARTMENT_HEAD | EMPLOYEE

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

      {/* Success/Error Banners */}
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
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-error/10 border border-error/30 rounded-xl p-4 flex items-center gap-3 text-error"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              error
            </span>
            <span className="text-sm font-semibold">{errorMessage}</span>
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
              {assets.map((a) => (
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
                    {selectedAsset.departmentName && `(${selectedAsset.departmentName} Dept)`}. Direct allocation is blocked.
                  </p>
                  <button
                    onClick={() => setShowTransferModal(true)}
                    className="bg-tertiary/15 text-tertiary border border-tertiary/25 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-tertiary/25 transition-all flex items-center gap-1.5 cursor-pointer"
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
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} {emp.departmentName && `— ${emp.departmentName}`} ({emp.role})
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
            className="w-full bg-primary text-on-primary font-bold px-4 py-3 rounded-lg text-xs uppercase tracking-wide hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 flex items-center justify-center gap-2 cursor-pointer"
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
              const style = STATUS_STYLES[tr.status] || { bg: "bg-surface-container", text: "text-on-surface-variant", icon: "pending" };
              
              // Validate permissions dynamically
              const canAct =
                (tr.status === "REQUESTED" && (userRole === "DEPARTMENT_HEAD" || userRole === "ADMIN")) ||
                (tr.status === "DEPT_HEAD_APPROVED" && (userRole === "ASSET_MANAGER" || userRole === "ADMIN"));

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
                          Allocated holder
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
                        {mapStatusToFront(tr.status)}
                      </span>
                      <p className="text-[10px] text-on-surface-variant font-mono mt-1">
                        {tr.requestDate}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-on-surface-variant border-t border-outline-variant/30 pt-2 font-mono">
                    {tr.notes}
                  </p>

                  {canAct && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleTransferAction(tr.id, tr.status, "Approved")}
                        className="flex-1 bg-success/10 text-success border border-success/25 px-3 py-1.5 rounded-lg text-xs font-bold uppercase hover:bg-success/20 transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                        Approve
                      </button>
                      <button
                        onClick={() => handleTransferAction(tr.id, tr.status, "Rejected")}
                        className="flex-1 bg-error/10 text-error border border-error/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase hover:bg-error/20 transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                        Reject
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
            {transfers.length === 0 && (
              <div className="text-center py-8 text-xs text-on-surface-variant italic">
                No active transfer requests found.
              </div>
            )}
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
              className="glass-card rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl bg-surface"
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
                  {employees.filter((e) => e.id !== selectedAsset.currentHolderId).map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} {emp.departmentName && `— ${emp.departmentName}`}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleRequestTransfer}
                disabled={!selectedEmployeeId}
                className="w-full bg-tertiary text-on-tertiary font-bold px-4 py-3 rounded-lg text-xs uppercase tracking-wide hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">send</span>
                Submit Transfer Request
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
