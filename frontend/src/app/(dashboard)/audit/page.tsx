"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import Modal from "@/components/ui/Modal";
import { apiFetch } from "@/lib/api";
import { useWebsockets } from "@/hooks/useWebsockets";

// --- Interfaces ---
interface AuditAsset {
  id: string;
  tag: string;
  name: string;
  category: string;
  location: string;
  currentHolder?: string;
  status: "Pending" | "Verified" | "Discrepancy";
  condition?: string;
  flagReason?: string;
  auditedAt?: string;
}

interface DiscrepancyItem {
  id: string;
  assetTag: string;
  assetName: string;
  type: string;
  details: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "Resolved";
  reportedAt: string;
  resolvedAt?: string;
  assignmentId: string;
  assetId: string;
}

interface AuditRound {
  id: string;
  title: string;
  scope: string;
  assignedAuditor: string;
  totalAssets: number;
  verifiedAssets: number;
  dueDate: string;
  status: "Not Started" | "In Progress" | "Completed";
  isLocked: boolean;
}

type Tab = "active" | "discrepancies" | "schedule";

export default function AuditPage() {
  const [activeTab, setActiveTab] = useState<Tab>("active");
  const [cycles, setCycles] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [scopeAssets, setScopeAssets] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Modals & Popup State
  const [selectedAsset, setSelectedAsset] = useState<AuditAsset | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showInitiateModal, setShowInitiateModal] = useState(false);

  // Forms State
  const [verifyCondition, setVerifyCondition] = useState<"New" | "Good" | "Fair" | "Poor">("Good");
  const [flagType, setFlagType] = useState<"Missing" | "Damaged" | "Location Mismatch" | "Holder Mismatch">("Location Mismatch");
  const [flagDetails, setFlagDetails] = useState("");
  const [flagSeverity, setFlagSeverity] = useState<"Critical" | "High" | "Medium" | "Low">("Medium");

  // New Audit Round Form
  const [newRoundTitle, setNewRoundTitle] = useState("");
  const [newRoundAuditorId, setNewRoundAuditorId] = useState("");
  const [newRoundScopeType, setNewRoundScopeType] = useState<"dept" | "loc">("dept");
  const [newRoundScopeId, setNewRoundScopeId] = useState("");
  const [newRoundDueDate, setNewRoundDueDate] = useState("");

  // Success banners
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [currentUser, setCurrentUser] = useState<any>(null);

  // Retrieve current user
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

  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      // 1. Fetch Audit Cycles
      const cyclesData = await apiFetch("/audits/cycles");
      setCycles(cyclesData);
      if (cyclesData.length > 0 && !selectedCycleId) {
        const active = cyclesData.find((c: any) => c.status === "IN_PROGRESS");
        setSelectedCycleId(active ? active.id : cyclesData[0].id);
      }

      // 2. Fetch Employees (Auditors list)
      const emps = await apiFetch("/auth/users");
      setEmployees(emps);

      // 3. Fetch Departments & Locations for scheduling scopes
      const depts = await apiFetch("/departments");
      setDepartments(depts);
      const locs = await apiFetch("/assets/locations");
      setLocations(locs);
    } catch (err: any) {
      console.error(err);
    }
  }, [selectedCycleId]);

  // Load Assignments whenever selected cycle changes
  const loadAssignments = useCallback(async () => {
    if (!selectedCycleId) return;
    try {
      const assigns = await apiFetch(`/audits/assignments?cycleId=${selectedCycleId}`);
      setAssignments(assigns);
      
      // Select the first assignment by default
      if (assigns.length > 0) {
        setSelectedAssignmentId(assigns[0].id);
      } else {
        setSelectedAssignmentId("");
        setScopeAssets([]);
        setVerifications([]);
      }
    } catch (err) {
      console.error(err);
    }
  }, [selectedCycleId]);

  // Load Assets and Verifications for selected scope assignment
  const loadAssignmentDetails = useCallback(async () => {
    if (!selectedAssignmentId) return;
    const assign = assignments.find((a) => a.id === selectedAssignmentId);
    if (!assign) return;

    try {
      // Fetch verifications for this assignment
      const verifs = await apiFetch(`/audits/verifications?assignmentId=${selectedAssignmentId}`);
      setVerifications(verifs);

      // Fetch assets scoped to this assignment's department or location
      let query = "";
      if (assign.departmentId) query = `?departmentId=${assign.departmentId}&limit=100`;
      else if (assign.locationId) query = `?locationId=${assign.locationId}&limit=100`;

      if (query) {
        const assetsData = await apiFetch(`/assets${query}`);
        setScopeAssets(assetsData.data || []);
      } else {
        setScopeAssets([]);
      }
    } catch (err) {
      console.error(err);
    }
  }, [selectedAssignmentId, assignments]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  useEffect(() => {
    loadAssignmentDetails();
  }, [loadAssignmentDetails]);

  // WebSocket Live Sync
  useWebsockets({
    onDashboardRefresh: () => {
      loadData();
      loadAssignments();
      loadAssignmentDetails();
    },
  });

  const getMappedAssets = useMemo(() => {
    return scopeAssets.map((asset: any) => {
      const verif = verifications.find((v: any) => v.assetId === asset.id);
      let status: "Pending" | "Verified" | "Discrepancy" = "Pending";
      let condition = undefined;
      let flagReason = undefined;

      if (verif) {
        if (verif.status === "VERIFIED") {
          status = "Verified";
          condition = verif.notes?.replace("Condition: ", "") || "Good";
        } else {
          status = "Discrepancy";
          flagReason = `${verif.status} - ${verif.notes}`;
        }
      }

      // Find holder name
      const holderName = asset.allocations && asset.allocations.length > 0
        ? `${asset.allocations[0].allocatedTo?.firstName} ${asset.allocations[0].allocatedTo?.lastName}`
        : undefined;

      return {
        id: asset.id,
        tag: asset.assetTag,
        name: asset.name,
        category: asset.category?.name || "Uncategorized",
        location: asset.location?.name || "No Location",
        currentHolder: holderName,
        status,
        condition,
        flagReason,
        auditedAt: verif ? new Date(verif.verifiedAt).toISOString().split("T")[0] : undefined,
      };
    });
  }, [scopeAssets, verifications]);

  const filteredAssets = useMemo(() => {
    return getMappedAssets.filter((a) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        a.tag.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        (a.currentHolder?.toLowerCase().includes(q) ?? false);
      const matchesStatus = !statusFilter || a.status === statusFilter;
      const matchesCategory = !categoryFilter || a.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [getMappedAssets, searchQuery, statusFilter, categoryFilter]);

  const categories = useMemo(() => {
    return Array.from(new Set(getMappedAssets.map((a) => a.category)));
  }, [getMappedAssets]);

  const stats = useMemo(() => {
    const total = getMappedAssets.length;
    const verified = getMappedAssets.filter((a) => a.status === "Verified").length;
    const discrepant = getMappedAssets.filter((a) => a.status === "Discrepancy").length;
    const rate = total > 0 ? Math.round((verified / total) * 100) : 0;
    return { total, verified, discrepant, rate };
  }, [getMappedAssets]);

  // Aggregate all discrepancies across all assignments
  const [allDiscrepancies, setAllDiscrepancies] = useState<DiscrepancyItem[]>([]);
  const loadAllVerifications = useCallback(async () => {
    try {
      const verifs = await apiFetch("/audits/verifications");
      const mapped = verifs
        .filter((v: any) => v.status !== "VERIFIED")
        .map((v: any) => ({
          id: v.id,
          assetTag: v.asset?.assetTag || "Unknown",
          assetName: v.asset?.name || "Unknown",
          type: v.status === "DAMAGED" ? "Damaged" : "Missing",
          details: v.notes || "Flagged during physical audit check.",
          severity: v.status === "MISSING" ? "Critical" : "High",
          status: "Open" as const,
          reportedAt: v.verifiedAt ? new Date(v.verifiedAt).toISOString().split("T")[0] : "",
          assignmentId: v.assignmentId,
          assetId: v.assetId,
        }));
      setAllDiscrepancies(mapped);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "discrepancies") {
      loadAllVerifications();
    }
  }, [activeTab, loadAllVerifications]);

  const handleOpenVerify = (asset: AuditAsset) => {
    setSelectedAsset(asset);
    setVerifyCondition("Good");
    setShowVerifyModal(true);
  };

  const handleConfirmVerify = async () => {
    if (!selectedAsset || !selectedAssignmentId) return;
    setErrorMessage("");
    try {
      await apiFetch("/audits/verifications", {
        method: "POST",
        body: JSON.stringify({
          assignmentId: selectedAssignmentId,
          assetId: selectedAsset.id,
          status: "VERIFIED",
          notes: `Condition: ${verifyCondition}`,
        }),
      });

      triggerSuccess(`✓ Asset ${selectedAsset.tag} marked as Verified (Condition: ${verifyCondition})`);
      setShowVerifyModal(false);
      setSelectedAsset(null);
      loadAssignmentDetails();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to record verification.");
    }
  };

  const handleOpenFlag = (asset: AuditAsset) => {
    setSelectedAsset(asset);
    setFlagType("Location Mismatch");
    setFlagDetails("");
    setFlagSeverity("Medium");
    setShowFlagModal(true);
  };

  const handleConfirmFlag = async () => {
    if (!selectedAsset || !selectedAssignmentId) return;
    setErrorMessage("");
    try {
      await apiFetch("/audits/verifications", {
        method: "POST",
        body: JSON.stringify({
          assignmentId: selectedAssignmentId,
          assetId: selectedAsset.id,
          status: flagType === "Missing" ? "MISSING" : "DAMAGED",
          notes: flagDetails || `${flagType} reported.`,
        }),
      });

      triggerSuccess(`⚠ Discrepancy logged for asset ${selectedAsset.tag} (${flagType})`);
      setShowFlagModal(false);
      setSelectedAsset(null);
      loadAssignmentDetails();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to log discrepancy.");
    }
  };

  const handleResolveDiscrepancy = async (item: DiscrepancyItem) => {
    setErrorMessage("");
    try {
      // Re-verify the asset to resolve the discrepancy
      await apiFetch("/audits/verifications", {
        method: "POST",
        body: JSON.stringify({
          assignmentId: item.assignmentId,
          assetId: item.assetId,
          status: "VERIFIED",
          notes: "Discrepancy resolved by manual correction.",
        }),
      });

      triggerSuccess("✓ Discrepancy resolved successfully.");
      loadAllVerifications();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to resolve discrepancy.");
    }
  };

  const handleInitiateRound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoundTitle || !newRoundAuditorId || !newRoundDueDate || !newRoundScopeId) return;

    setErrorMessage("");
    try {
      // 1. Create Cycle
      const cycle = await apiFetch("/audits/cycles", {
        method: "POST",
        body: JSON.stringify({
          name: newRoundTitle,
          startDate: new Date().toISOString(),
          endDate: new Date(newRoundDueDate).toISOString(),
          status: "IN_PROGRESS",
        }),
      });

      // 2. Create Assignment
      const payload: Record<string, string> = {
        cycleId: cycle.id,
        auditorId: newRoundAuditorId,
      };
      if (newRoundScopeType === "dept") payload.departmentId = newRoundScopeId;
      else payload.locationId = newRoundScopeId;

      await apiFetch("/audits/assignments", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      triggerSuccess(`✓ Audit Round "${newRoundTitle}" initiated and scoped successfully.`);
      setNewRoundTitle("");
      setNewRoundAuditorId("");
      setNewRoundScopeId("");
      setNewRoundDueDate("");
      setShowInitiateModal(false);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate audit round.");
    }
  };

  // Convert cycles to audit rounds format
  const mappedRounds = useMemo(() => {
    return cycles.map((c) => {
      const auditorNames = c.assignments?.map((a: any) => `${a.auditor?.firstName} ${a.auditor?.lastName}`).join(", ") || "No Auditor";
      const total = c.assignments?.length || 0;

      let statusText: "Not Started" | "In Progress" | "Completed" = "Not Started";
      if (c.status === "IN_PROGRESS") statusText = "In Progress";
      else if (c.status === "COMPLETED") statusText = "Completed";

      return {
        id: c.id,
        title: c.name,
        scope: c.assignments?.map((a: any) => a.department?.name || a.location?.name).filter(Boolean).join(", ") || "All Assets",
        assignedAuditor: auditorNames,
        totalAssets: total * 5 + 5, // mock scope sizes or display assignments count
        verifiedAssets: total * 3,
        dueDate: c.endDate ? new Date(c.endDate).toISOString().split("T")[0] : "No date",
        status: statusText,
        isLocked: c.isLocked,
      };
    });
  }, [cycles]);

  const activeRound = mappedRounds.find((r) => r.status === "In Progress") || mappedRounds[0];

  return (
    <div className="space-y-6">
      {/* Success/Error Notifications */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-secondary/15 border border-secondary/35 rounded-xl p-4 flex items-center gap-3 text-secondary"
          >
            <span className="material-symbols-outlined text-lg">task_alt</span>
            <span className="text-sm font-semibold">{successMessage}</span>
          </motion.div>
        )}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-error/15 border border-error/35 rounded-xl p-4 flex items-center gap-3 text-error"
          >
            <span className="material-symbols-outlined text-lg">error</span>
            <span className="text-sm font-semibold">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-hanken font-bold text-3xl tracking-tight text-on-surface">
            Asset Verification & Audit
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Conduct cyclic physical audits, verify conditions, and resolve tracking discrepancies.
          </p>
        </div>
        <button
          onClick={() => setShowInitiateModal(true)}
          className="bg-primary text-on-primary font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wide hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">schedule_send</span>
          Initiate Audit Round
        </button>
      </div>

      {/* Top Banner Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5 flex items-center gap-4 bg-surface">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-2xl">fact_check</span>
          </div>
          <div>
            <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">Completion Rate</p>
            <h4 className="font-bold text-2xl text-on-surface mt-1">{stats.rate}%</h4>
            <div className="w-24 bg-surface-container-highest h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${stats.rate}%` }} />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 flex items-center gap-4 bg-surface">
          <div className="w-12 h-12 bg-tertiary/10 rounded-xl flex items-center justify-center text-tertiary shrink-0">
            <span className="material-symbols-outlined text-2xl">pending_actions</span>
          </div>
          <div>
            <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">Scope Assets</p>
            <h4 className="font-bold text-2xl text-on-surface mt-1">
              {stats.total} <span className="text-xs text-on-surface-variant font-normal">items</span>
            </h4>
            <p className="text-[10px] text-on-surface-variant mt-1.5">For active scope assignment</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 flex items-center gap-4 bg-surface">
          <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center text-error shrink-0">
            <span className="material-symbols-outlined text-2xl">warning</span>
          </div>
          <div>
            <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">Discrepancies</p>
            <h4 className="font-bold text-2xl text-error mt-1">
              {stats.discrepant} <span className="text-xs text-on-surface-variant font-normal">flagged</span>
            </h4>
            <p className="text-[10px] text-on-surface-variant mt-1.5">Requires maintenance check</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 flex items-center gap-4 bg-surface">
          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined text-2xl">assignment_ind</span>
          </div>
          <div>
            <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">Active Round</p>
            <h4 className="font-bold text-xs text-on-surface mt-1.5 truncate max-w-[150px]">
              {activeRound?.title || "None Scheduled"}
            </h4>
            <p className="text-[10px] text-secondary font-semibold mt-0.5">Due: {activeRound?.dueDate}</p>
          </div>
        </div>
      </div>

      {/* Select Cycle & Scope selector */}
      <div className="glass-card p-4 rounded-xl flex flex-wrap gap-4 items-center bg-surface">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Cycle:</span>
          <select
            value={selectedCycleId}
            onChange={(e) => setSelectedCycleId(e.target.value)}
            className="bg-surface-container border border-outline-variant rounded px-2.5 py-1.5 text-xs text-on-surface cursor-pointer outline-none focus:ring-1 focus:ring-primary"
          >
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            {cycles.length === 0 && <option value="">No Active Cycles</option>}
          </select>
        </div>

        {assignments.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Scope Assignment:</span>
            <select
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
              className="bg-surface-container border border-outline-variant rounded px-2.5 py-1.5 text-xs text-on-surface cursor-pointer outline-none focus:ring-1 focus:ring-primary"
            >
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  Scope: {a.department?.name || a.location?.name || "All"} (Auditor: {a.auditor?.firstName})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-outline-variant/30 flex gap-2">
        {(["active", "discrepancies", "schedule"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {tab === "active" ? "clinical_notes" : tab === "discrepancies" ? "dangerous" : "schedule"}
            </span>
            {tab === "active"
              ? "Active Verification"
              : tab === "discrepancies"
              ? "Discrepancy Log"
              : "Audit Schedules"}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[400px]">
        {/* --- Tab 1: Active Verification --- */}
        {activeTab === "active" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-container/30 p-3 rounded-xl border border-outline-variant/30 bg-surface">
              <div className="relative flex-1 max-w-md">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-base">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search assets by tag, name, holder or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/50 rounded-lg pl-9 pr-4 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-surface-container border border-outline-variant/50 rounded-lg px-3 py-2 text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-surface-container border border-outline-variant/50 rounded-lg px-3 py-2 text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Verified">Verified</option>
                  <option value="Discrepancy">Discrepancy</option>
                </select>
              </div>
            </div>

            {/* Assets Table */}
            <div className="glass-card rounded-xl overflow-hidden border border-outline-variant/30 bg-surface shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container/50">
                      <th className="text-left px-6 py-3.5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">Asset Tag</th>
                      <th className="text-left px-6 py-3.5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">Asset Details</th>
                      <th className="text-left px-6 py-3.5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">Audit Status</th>
                      <th className="text-left px-6 py-3.5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">Location</th>
                      <th className="text-left px-6 py-3.5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">Current Holder</th>
                      <th className="text-right px-6 py-3.5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">Verification Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {filteredAssets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">inventory_2</span>
                            <p className="text-on-surface-variant text-sm">Select an assignment scope or register assets to verify.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredAssets.map((asset) => (
                        <tr key={asset.id} className="hover:bg-surface-container-high/15 transition-all group">
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs bg-surface-container px-2.5 py-1.5 rounded text-primary font-semibold tracking-wider border border-outline-variant/30">
                              {asset.tag}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-on-surface">{asset.name}</div>
                            <div className="text-xs text-on-surface-variant mt-0.5">{asset.category}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                                asset.status === "Verified"
                                  ? "bg-success/10 text-success border-success/25"
                                  : asset.status === "Discrepancy"
                                  ? "bg-error/10 text-error border-error/25"
                                  : "bg-info/10 text-info border-info/25"
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {asset.status}
                              {asset.condition && ` (${asset.condition})`}
                            </span>
                            {asset.flagReason && (
                              <p className="text-[10px] text-error mt-1 italic max-w-[200px] truncate" title={asset.flagReason}>
                                {asset.flagReason}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-on-surface-variant text-xs font-mono">
                            {asset.location}
                          </td>
                          <td className="px-6 py-4">
                            {asset.currentHolder ? (
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center text-[9px] font-bold text-secondary">
                                  {asset.currentHolder.charAt(0)}
                                </div>
                                <span className="text-on-surface text-xs font-semibold">{asset.currentHolder}</span>
                              </div>
                            ) : (
                              <span className="text-on-surface-variant/40 text-xs italic">— Storage</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {asset.status === "Pending" ? (
                              <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenVerify(asset)}
                                  className="bg-success/10 text-success border border-success/25 hover:bg-success/20 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                                >
                                  Verify
                                </button>
                                <button
                                  onClick={() => handleOpenFlag(asset)}
                                  className="bg-error/10 text-error border border-error/20 hover:bg-error/20 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                                >
                                  Flag
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-on-surface-variant font-mono">
                                Verified {asset.auditedAt}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- Tab 2: Discrepancy Log --- */}
        {activeTab === "discrepancies" && (
          <div className="space-y-4">
            <div className="glass-card rounded-xl overflow-hidden border border-outline-variant/30 bg-surface shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container/50">
                      <th className="text-left px-6 py-3.5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">Asset</th>
                      <th className="text-left px-6 py-3.5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">Type</th>
                      <th className="text-left px-6 py-3.5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">Discrepancy Details</th>
                      <th className="text-left px-6 py-3.5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">Severity</th>
                      <th className="text-left px-6 py-3.5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">Reported Date</th>
                      <th className="text-right px-6 py-3.5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {allDiscrepancies.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <span className="material-symbols-outlined text-4xl text-secondary/40">fact_check</span>
                            <p className="text-on-surface-variant text-sm font-semibold">Clean Sheet! No discrepancy records found.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      allDiscrepancies.map((item) => (
                        <tr key={item.id} className="hover:bg-surface-container-high/15 transition-all">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-on-surface">{item.assetName}</div>
                            <span className="font-mono text-[10px] bg-surface-container px-1.5 py-0.5 rounded text-on-surface-variant mt-1 inline-block">
                              {item.assetTag}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-error">
                            {item.type}
                          </td>
                          <td className="px-6 py-4 text-xs text-on-surface-variant max-w-sm leading-relaxed">
                            {item.details}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                item.severity === "Critical"
                                  ? "bg-error/20 text-error"
                                  : item.severity === "High"
                                  ? "bg-tertiary/20 text-tertiary"
                                  : "bg-surface-container-high text-on-surface-variant"
                              }`}
                            >
                              {item.severity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-on-surface-variant">
                            {item.reportedAt}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleResolveDiscrepancy(item)}
                              className="bg-secondary/15 text-secondary border border-secondary/25 hover:bg-secondary/25 px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer"
                            >
                              Resolve
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- Tab 3: Audit Schedules --- */}
        {activeTab === "schedule" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mappedRounds.map((round) => (
                <div key={round.id} className="glass-card rounded-xl p-5 space-y-4 bg-surface shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-base text-on-surface leading-snug">{round.title}</h4>
                      <p className="text-[10px] text-on-surface-variant font-mono mt-1">Scope: {round.scope}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        round.status === "Completed"
                          ? "bg-success/10 text-success"
                          : round.status === "In Progress"
                          ? "bg-info/10 text-info"
                          : "bg-surface-container-high text-on-surface-variant"
                      }`}
                    >
                      {round.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-on-surface-variant">
                      <span>Auditor: <strong>{round.assignedAuditor}</strong></span>
                      <span className="font-mono font-semibold">Due: {round.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
              {mappedRounds.length === 0 && (
                <div className="col-span-3 text-center py-12 text-xs italic text-on-surface-variant">
                  No audit rounds scheduled.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Verify Condition Modal */}
      <Modal isOpen={showVerifyModal} onClose={() => setShowVerifyModal(false)} title="Verify Asset Condition">
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            Please log the physical condition of <strong>{selectedAsset?.name} ({selectedAsset?.tag})</strong>.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Asset Condition
            </label>
            <select
              value={verifyCondition}
              onChange={(e: any) => setVerifyCondition(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none cursor-pointer focus:ring-1 focus:ring-primary"
            >
              <option value="New">New / Excellent</option>
              <option value="Good">Good / Working</option>
              <option value="Fair">Fair / Worn out</option>
              <option value="Poor">Poor / Broken</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowVerifyModal(false)}
              className="flex-1 bg-surface-container border border-outline-variant text-on-surface font-semibold py-2 rounded text-xs uppercase"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmVerify}
              className="flex-1 bg-secondary text-on-secondary font-bold py-2 rounded text-xs uppercase hover:brightness-110 transition-all cursor-pointer"
            >
              Confirm Verification
            </button>
          </div>
        </div>
      </Modal>

      {/* Flag Discrepancy Modal */}
      <Modal isOpen={showFlagModal} onClose={() => setShowFlagModal(false)} title="Flag Asset Discrepancy">
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            Describe the discrepancy or anomaly for asset <strong>{selectedAsset?.name} ({selectedAsset?.tag})</strong>.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Discrepancy Type
              </label>
              <select
                value={flagType}
                onChange={(e: any) => setFlagType(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none cursor-pointer focus:ring-1 focus:ring-primary"
              >
                <option value="Location Mismatch">Location Mismatch</option>
                <option value="Holder Mismatch">Holder Mismatch</option>
                <option value="Damaged">Damaged / Broken</option>
                <option value="Missing">Missing / Stolen</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Severity
              </label>
              <select
                value={flagSeverity}
                onChange={(e: any) => setFlagSeverity(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none cursor-pointer focus:ring-1 focus:ring-primary"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Discrepancy Details
            </label>
            <textarea
              value={flagDetails}
              onChange={(e) => setFlagDetails(e.target.value)}
              rows={3}
              placeholder="Provide exact details of the discrepancy observed..."
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none resize-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowFlagModal(false)}
              className="flex-1 bg-surface-container border border-outline-variant text-on-surface font-semibold py-2 rounded text-xs uppercase"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmFlag}
              className="flex-1 bg-error text-on-error font-bold py-2 rounded text-xs uppercase hover:brightness-110 transition-all cursor-pointer"
            >
              Flag Asset
            </button>
          </div>
        </div>
      </Modal>

      {/* Initiate Round Modal */}
      <Modal isOpen={showInitiateModal} onClose={() => setShowInitiateModal(false)} title="Initiate Audit Round">
        <form onSubmit={handleInitiateRound} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Audit Round Title
            </label>
            <input
              type="text"
              required
              value={newRoundTitle}
              onChange={(e) => setNewRoundTitle(e.target.value)}
              placeholder="e.g. Q3 Hardware Inventory Audit"
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Assigned Auditor
            </label>
            <select
              required
              value={newRoundAuditorId}
              onChange={(e) => setNewRoundAuditorId(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none cursor-pointer focus:ring-1 focus:ring-primary"
            >
              <option value="">Select Auditor...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.role})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Scope Scoping
              </label>
              <select
                value={newRoundScopeType}
                onChange={(e: any) => {
                  setNewRoundScopeType(e.target.value);
                  setNewRoundScopeId("");
                }}
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none cursor-pointer focus:ring-1 focus:ring-primary"
              >
                <option value="dept">Department-wide</option>
                <option value="loc">Location-wide</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Target Scope ID
              </label>
              <select
                required
                value={newRoundScopeId}
                onChange={(e) => setNewRoundScopeId(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none cursor-pointer focus:ring-1 focus:ring-primary"
              >
                <option value="">Choose target...</option>
                {newRoundScopeType === "dept"
                  ? departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))
                  : locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.code})
                      </option>
                    ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Due Date
            </label>
            <input
              type="date"
              required
              value={newRoundDueDate}
              onChange={(e) => setNewRoundDueDate(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowInitiateModal(false)}
              className="flex-1 bg-surface-container border border-outline-variant text-on-surface font-semibold py-2.5 rounded-lg text-xs uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary text-on-primary font-bold py-2.5 rounded-lg text-xs uppercase hover:brightness-110 transition-all cursor-pointer"
            >
              Schedule Audit Scope
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
