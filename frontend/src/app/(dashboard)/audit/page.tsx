"use client";

/**
 * @module AuditPage
 * @description Asset Verification & Audit dashboard view.
 *              Allows scheduling audits, verifying inventory status, and logging discrepancies.
 * @authors Antigravity
 * @status Complete
 */

import React, { useState, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import Modal from "@/components/ui/Modal";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface AuditAsset {
  id: string;
  tag: string;
  name: string;
  category: string;
  location: string;
  currentHolder?: string;
  status: "Pending" | "Verified" | "Discrepancy";
  condition?: "New" | "Good" | "Fair" | "Poor";
  flagReason?: string;
  auditedAt?: string;
}

interface DiscrepancyItem {
  id: string;
  assetTag: string;
  assetName: string;
  type: "Missing" | "Damaged" | "Location Mismatch" | "Holder Mismatch";
  details: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "Investigating" | "Resolved";
  reportedAt: string;
  resolvedAt?: string;
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
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const INITIAL_AUDIT_ASSETS: AuditAsset[] = [
  { id: "1", tag: "AF-0001", name: "MacBook Pro 14\"", category: "Laptops", location: "IT Floor – Desk 12", currentHolder: "Priya Shah", status: "Pending" },
  { id: "2", tag: "AF-0002", name: "ThinkPad X1 Carbon", category: "Laptops", location: "Storage Room A", currentHolder: undefined, status: "Verified", condition: "Good", auditedAt: "2026-07-11" },
  { id: "3", tag: "AF-0003", name: 'Dell UltraSharp 27"', category: "Monitors", location: "IT Floor – Desk 01", currentHolder: "Rahul Mehta", status: "Pending" },
  { id: "4", tag: "AF-0004", name: "Epson Projector EB-X51", category: "Projectors", location: "Conference Room B", currentHolder: undefined, status: "Discrepancy", flagReason: "Location Mismatch - Found in Room A instead", auditedAt: "2026-07-10" },
  { id: "5", tag: "AF-0005", name: "iPhone 14 Pro", category: "Smartphones", location: "HR Department", currentHolder: "Anjali Verma", status: "Pending" },
  { id: "6", tag: "AF-0006", name: "Cisco Catalyst 2960", category: "Switches", location: "Server Room", currentHolder: undefined, status: "Verified", condition: "New", auditedAt: "2026-07-09" },
  { id: "7", tag: "AF-0007", name: "Office Chair — Ergonomic", category: "Chairs", location: "Operations Floor", currentHolder: "Meera Pillai", status: "Pending" },
  { id: "8", tag: "AF-0010", name: "Dell PowerEdge R740", category: "Servers", location: "Data Center", currentHolder: undefined, status: "Pending" },
];

const INITIAL_DISCREPANCIES: DiscrepancyItem[] = [
  {
    id: "d1",
    assetTag: "AF-0004",
    assetName: "Epson Projector EB-X51",
    type: "Location Mismatch",
    details: "Expected in Conference Room B, but was found in Storage Room A without handover logs.",
    severity: "Medium",
    status: "Open",
    reportedAt: "2026-07-10",
  },
  {
    id: "d2",
    assetTag: "AF-0008",
    assetName: "iPad Pro 12.9\"",
    type: "Missing",
    details: "Employee reported asset was stolen or misplaced during transition. Last seen at HQ Floor 3.",
    severity: "Critical",
    status: "Investigating",
    reportedAt: "2026-07-05",
  },
  {
    id: "d3",
    assetTag: "AF-0012",
    assetName: "Logitech MX Master 3S",
    type: "Damaged",
    details: "Scroll wheel broken and battery failing to charge. Requires maintenance replacement.",
    severity: "Low",
    status: "Resolved",
    reportedAt: "2026-07-01",
    resolvedAt: "2026-07-04",
  },
];

const INITIAL_ROUNDS: AuditRound[] = [
  { id: "r1", title: "Q3 Hardware Audit", scope: "Laptops & Mobile Devices", assignedAuditor: "Sunil Verma", totalAssets: 48, verifiedAssets: 32, dueDate: "2026-07-25", status: "In Progress" },
  { id: "r2", title: "Server Room Inventory Check", scope: "Networking & Server Racks", assignedAuditor: "Deepak Joshi", totalAssets: 15, verifiedAssets: 15, dueDate: "2026-07-10", status: "Completed" },
  { id: "r3", title: "Marketing Dept Furniture Audit", scope: "Chairs, Desks, and Displays", assignedAuditor: "Anil Sharma", totalAssets: 35, verifiedAssets: 0, dueDate: "2026-08-15", status: "Not Started" },
];

type Tab = "active" | "discrepancies" | "schedule";

export default function AuditPage() {
  const [activeTab, setActiveTab] = useState<Tab>("active");
  const [auditAssets, setAuditAssets] = useState<AuditAsset[]>(INITIAL_AUDIT_ASSETS);
  const [discrepancies, setDiscrepancies] = useState<DiscrepancyItem[]>(INITIAL_DISCREPANCIES);
  const [rounds, setRounds] = useState<AuditRound[]>(INITIAL_ROUNDS);

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
  const [newRoundScope, setNewRoundScope] = useState("All Assets");
  const [newRoundAuditor, setNewRoundAuditor] = useState("");
  const [newRoundDueDate, setNewRoundDueDate] = useState("");

  // Success banners
  const [successMessage, setSuccessMessage] = useState("");

  // ─── Actions ────────────────────────────────────────────────────────────────

  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handleOpenVerify = (asset: AuditAsset) => {
    setSelectedAsset(asset);
    setVerifyCondition("Good");
    setShowVerifyModal(true);
  };

  const handleConfirmVerify = () => {
    if (!selectedAsset) return;
    setAuditAssets((prev) =>
      prev.map((item) =>
        item.id === selectedAsset.id
          ? { ...item, status: "Verified", condition: verifyCondition, auditedAt: new Date().toISOString().split("T")[0] }
          : item
      )
    );
    // Update the round progress (assuming current round r1)
    setRounds((prev) =>
      prev.map((r) =>
        r.id === "r1" ? { ...r, verifiedAssets: Math.min(r.totalAssets, r.verifiedAssets + 1) } : r
      )
    );
    triggerSuccess(`✓ Asset ${selectedAsset.tag} marked as Verified (Condition: ${verifyCondition})`);
    setShowVerifyModal(false);
    setSelectedAsset(null);
  };

  const handleOpenFlag = (asset: AuditAsset) => {
    setSelectedAsset(asset);
    setFlagType("Location Mismatch");
    setFlagDetails("");
    setFlagSeverity("Medium");
    setShowFlagModal(true);
  };

  const handleConfirmFlag = () => {
    if (!selectedAsset) return;
    
    // Update status in active list
    setAuditAssets((prev) =>
      prev.map((item) =>
        item.id === selectedAsset.id
          ? { ...item, status: "Discrepancy", flagReason: `${flagType} - ${flagDetails}`, auditedAt: new Date().toISOString().split("T")[0] }
          : item
      )
    );

    // Insert into Discrepancy Log
    const newDiscrepancy: DiscrepancyItem = {
      id: `d${Date.now()}`,
      assetTag: selectedAsset.tag,
      assetName: selectedAsset.name,
      type: flagType,
      details: flagDetails || `${flagType} flagged during audit round.`,
      severity: flagSeverity,
      status: "Open",
      reportedAt: new Date().toISOString().split("T")[0],
    };
    setDiscrepancies((prev) => [newDiscrepancy, ...prev]);

    triggerSuccess(`⚠ Discrepancy logged for asset ${selectedAsset.tag} (${flagType})`);
    setShowFlagModal(false);
    setSelectedAsset(null);
  };

  const handleResolveDiscrepancy = (id: string) => {
    setDiscrepancies((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: "Resolved", resolvedAt: new Date().toISOString().split("T")[0] } : d
      )
    );
    triggerSuccess("✓ Discrepancy resolved successfully.");
  };

  const handleInitiateRound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoundTitle || !newRoundAuditor || !newRoundDueDate) return;

    const newRound: AuditRound = {
      id: `r${Date.now()}`,
      title: newRoundTitle,
      scope: newRoundScope,
      assignedAuditor: newRoundAuditor,
      totalAssets: 20 + Math.floor(Math.random() * 30),
      verifiedAssets: 0,
      dueDate: newRoundDueDate,
      status: "Not Started",
    };

    setRounds((prev) => [newRound, ...prev]);
    triggerSuccess(`✓ Audit Round "${newRoundTitle}" initiated and assigned to ${newRoundAuditor}.`);
    
    // Reset Form
    setNewRoundTitle("");
    setNewRoundScope("All Assets");
    setNewRoundAuditor("");
    setNewRoundDueDate("");
    setShowInitiateModal(false);
  };

  // ─── Calculations / Filtered Data ───────────────────────────────────────────

  const filteredAssets = useMemo(() => {
    return auditAssets.filter((a) => {
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
  }, [auditAssets, searchQuery, statusFilter, categoryFilter]);

  const categories = useMemo(() => {
    return Array.from(new Set(auditAssets.map((a) => a.category)));
  }, [auditAssets]);

  const stats = useMemo(() => {
    const total = auditAssets.length;
    const verified = auditAssets.filter((a) => a.status === "Verified").length;
    const discrepant = auditAssets.filter((a) => a.status === "Discrepancy").length;
    const rate = total > 0 ? Math.round((verified / total) * 100) : 0;
    return { total, verified, discrepant, rate };
  }, [auditAssets]);

  return (
    <div className="space-y-6">
      {/* Success Notification Banner */}
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
          className="bg-primary text-on-primary font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wide hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-sm">schedule_send</span>
          Initiate Audit Round
        </button>
      </div>

      {/* Top Banner Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5 flex items-center gap-4">
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

        <div className="glass-card rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-tertiary/10 rounded-xl flex items-center justify-center text-tertiary shrink-0">
            <span className="material-symbols-outlined text-2xl">pending_actions</span>
          </div>
          <div>
            <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">Pending Audits</p>
            <h4 className="font-bold text-2xl text-on-surface mt-1">
              {auditAssets.filter((a) => a.status === "Pending").length} <span className="text-xs text-on-surface-variant font-normal">items</span>
            </h4>
            <p className="text-[10px] text-on-surface-variant mt-1.5">For active Q3 round</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center text-error shrink-0">
            <span className="material-symbols-outlined text-2xl">warning</span>
          </div>
          <div>
            <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">Discrepancies</p>
            <h4 className="font-bold text-2xl text-error mt-1">
              {discrepancies.filter((d) => d.status === "Open" || d.status === "Investigating").length} <span className="text-xs text-on-surface-variant font-normal">open</span>
            </h4>
            <p className="text-[10px] text-on-surface-variant mt-1.5">Immediate review recommended</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined text-2xl">assignment_ind</span>
          </div>
          <div>
            <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">Active Round</p>
            <h4 className="font-bold text-lg text-on-surface mt-1 truncate max-w-[150px]">Q3 Hardware</h4>
            <p className="text-[10px] text-secondary font-semibold mt-1">Due: July 25</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-outline-variant/30 flex gap-2">
        {(["active", "discrepancies", "schedule"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-container/30 p-3 rounded-xl border border-outline-variant/30">
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
            <div className="glass-card rounded-xl overflow-hidden border border-outline-variant/30">
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
                            <p className="text-on-surface-variant text-sm">No assets match your current filter settings.</p>
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
                                  ? "bg-secondary/10 text-secondary border-secondary/20"
                                  : asset.status === "Discrepancy"
                                  ? "bg-error/10 text-error border-error/20"
                                  : "bg-primary/10 text-primary border-primary/20"
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
                              <span className="text-on-surface-variant/40 text-xs italic">Unassigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {asset.status === "Pending" ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenVerify(asset)}
                                  className="bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-[14px]">done</span>
                                  Pass
                                </button>
                                <button
                                  onClick={() => handleOpenFlag(asset)}
                                  className="bg-error/10 text-error border border-error/20 hover:bg-error/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-[14px]">flag</span>
                                  Flag
                                </button>
                              </div>
                            ) : (
                              <span className="text-on-surface-variant/50 text-xs font-mono font-bold uppercase mr-2">
                                Audited ({asset.auditedAt})
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
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-on-surface-variant">
                Items marked as discrepant by auditors. Resolving an issue updates the audit catalog.
              </p>
              <span className="text-[10px] font-mono bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">
                {discrepancies.length} entries log
              </span>
            </div>

            <div className="space-y-3">
              {discrepancies.map((d) => (
                <div key={d.id} className="glass-card rounded-xl p-5 border border-outline-variant/30 flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs bg-surface-container px-2 py-1 rounded text-primary font-semibold border border-outline-variant/30">
                        {d.assetTag}
                      </span>
                      <h4 className="font-bold text-on-surface text-sm md:text-base">{d.assetName}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        d.severity === "Critical" ? "bg-error/20 text-error" : d.severity === "High" ? "bg-error/10 text-error" : "bg-tertiary/15 text-tertiary"
                      }`}>
                        {d.severity} Priority
                      </span>
                    </div>

                    <p className="text-on-surface-variant text-xs leading-relaxed max-w-2xl">{d.details}</p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-on-surface-variant/70 border-t border-outline-variant/20 pt-2 font-mono">
                      <span>Reported: {d.reportedAt}</span>
                      <span>Type: <strong className="text-on-surface">{d.type}</strong></span>
                      {d.resolvedAt && <span className="text-secondary">Resolved: {d.resolvedAt}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:self-center shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      d.status === "Resolved"
                        ? "bg-secondary/10 text-secondary border-secondary/20"
                        : d.status === "Investigating"
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-tertiary/10 text-tertiary border-tertiary/20"
                    }`}>
                      {d.status}
                    </span>

                    {d.status !== "Resolved" && (
                      <button
                        onClick={() => handleResolveDiscrepancy(d.id)}
                        className="bg-primary text-on-primary font-bold px-3 py-1.5 rounded-lg text-xs uppercase hover:brightness-110 active:scale-95 transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">check</span>
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Tab 3: Schedule Audit Rounds --- */}
        {activeTab === "schedule" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-on-surface-variant">
                Scheduled cyclic verifications. Active round updates metrics summaries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {rounds.map((round) => {
                const completionPct = round.totalAssets > 0 ? Math.round((round.verifiedAssets / round.totalAssets) * 100) : 0;
                return (
                  <div key={round.id} className="glass-card rounded-xl p-5 border border-outline-variant/30 flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-on-surface text-base">{round.title}</h4>
                          <p className="text-on-surface-variant text-[11px] mt-0.5">{round.scope}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          round.status === "Completed" ? "bg-secondary/15 text-secondary" : round.status === "In Progress" ? "bg-primary/15 text-primary" : "bg-surface-container-high text-on-surface-variant"
                        }`}>
                          {round.status}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-on-surface-variant font-mono">
                          <span>Progress</span>
                          <span>{round.verifiedAssets} / {round.totalAssets} assets ({completionPct}%)</span>
                        </div>
                        <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${round.status === "Completed" ? "bg-secondary" : "bg-primary"}`} style={{ width: `${completionPct}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-outline-variant/20 pt-3 flex items-center justify-between text-xs text-on-surface-variant font-mono">
                      <span>Auditor: <strong>{round.assignedAuditor}</strong></span>
                      <span className="text-[10px]">Due: {round.dueDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ─── Modal 1: Verify (Pass) Asset ─── */}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        title="Verify Asset Condition"
        size="sm"
      >
        <div className="space-y-4">
          {selectedAsset && (
            <div className="bg-surface-container-low border border-outline-variant/30 p-3 rounded-lg space-y-1">
              <p className="text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">Asset Tag & Name</p>
              <p className="text-sm font-bold text-on-surface">{selectedAsset.tag} — {selectedAsset.name}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider block">
              Confirm Current Condition
            </label>
            <select
              value={verifyCondition}
              onChange={(e) => setVerifyCondition(e.target.value as any)}
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="New">New / Excellent</option>
              <option value="Good">Good (Nominal)</option>
              <option value="Fair">Fair (Slight wear)</option>
              <option value="Poor">Poor (Requires service)</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowVerifyModal(false)}
              className="flex-1 bg-surface-container border border-outline-variant text-on-surface font-semibold py-2 rounded-lg text-xs uppercase tracking-wide hover:bg-surface-container-high transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmVerify}
              className="flex-1 bg-secondary text-on-secondary font-bold py-2 rounded-lg text-xs uppercase tracking-wide hover:brightness-110 active:scale-95 transition-all"
            >
              Verify (Pass)
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── Modal 2: Flag Discrepancy ─── */}
      <Modal
        isOpen={showFlagModal}
        onClose={() => setShowFlagModal(false)}
        title="Log Audit Discrepancy"
        size="md"
      >
        <div className="space-y-4">
          {selectedAsset && (
            <div className="bg-surface-container-low border border-outline-variant/30 p-3 rounded-lg space-y-1">
              <p className="text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">Asset Tag & Name</p>
              <p className="text-sm font-bold text-on-surface">{selectedAsset.tag} — {selectedAsset.name}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider block">
                Discrepancy Type
              </label>
              <select
                value={flagType}
                onChange={(e) => setFlagType(e.target.value as any)}
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Location Mismatch">Location Mismatch</option>
                <option value="Damaged">Damaged / Broken</option>
                <option value="Missing">Missing / Untraceable</option>
                <option value="Holder Mismatch">Holder Mismatch</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider block">
                Severity Level
              </label>
              <select
                value={flagSeverity}
                onChange={(e) => setFlagSeverity(e.target.value as any)}
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Critical">Critical Priority</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider block">
              Details / Observations
            </label>
            <textarea
              value={flagDetails}
              onChange={(e) => setFlagDetails(e.target.value)}
              rows={3}
              placeholder="Provide context or explanation for the flag..."
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowFlagModal(false)}
              className="flex-1 bg-surface-container border border-outline-variant text-on-surface font-semibold py-2.5 rounded-lg text-xs uppercase tracking-wide hover:bg-surface-container-high transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmFlag}
              className="flex-1 bg-error text-on-error font-bold py-2.5 rounded-lg text-xs uppercase tracking-wide hover:brightness-110 active:scale-95 transition-all"
            >
              Log Discrepancy
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── Modal 3: Initiate New Audit Round ─── */}
      <Modal
        isOpen={showInitiateModal}
        onClose={() => setShowInitiateModal(false)}
        title="Initiate New Audit Cycle"
        size="md"
      >
        <form onSubmit={handleInitiateRound} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider block">
              Audit Round Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Q4 Server Room Audit"
              value={newRoundTitle}
              onChange={(e) => setNewRoundTitle(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider block">
                Scope / Category Filter
              </label>
              <select
                value={newRoundScope}
                onChange={(e) => setNewRoundScope(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="All Assets">All Assets</option>
                <option value="Laptops & Tablets">Laptops & Tablets</option>
                <option value="Networking & Servers">Networking & Servers</option>
                <option value="Office Furniture">Office Furniture</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider block">
                Assigned Auditor
              </label>
              <select
                value={newRoundAuditor}
                onChange={(e) => setNewRoundAuditor(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary"
                required
              >
                <option value="">Select Auditor...</option>
                <option value="Sunil Verma">Sunil Verma</option>
                <option value="Deepak Joshi">Deepak Joshi</option>
                <option value="Anil Sharma">Anil Sharma</option>
                <option value="Ramesh Kumar">Ramesh Kumar</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider block">
              Audit Due Date
            </label>
            <input
              type="date"
              required
              value={newRoundDueDate}
              onChange={(e) => setNewRoundDueDate(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowInitiateModal(false)}
              className="flex-1 bg-surface-container border border-outline-variant text-on-surface font-semibold py-2.5 rounded-lg text-xs uppercase tracking-wide hover:bg-surface-container-high transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary text-on-primary font-bold py-2.5 rounded-lg text-xs uppercase tracking-wide hover:brightness-110 active:scale-95 transition-all"
            >
              Start Round
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
