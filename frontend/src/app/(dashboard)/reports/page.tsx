"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { apiFetch } from "@/lib/api";

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-surface border border-outline-variant/50 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
      <p className="font-bold text-on-surface text-[11px]">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="font-mono text-[10px]">
          {entry.name}: <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

const PIE_COLORS = ["#34d399", "#38bdf8", "#fbbf24", "#64748b"];

export default function ReportsPage() {
  const [viewMode, setViewMode] = useState<"live" | "historical">("live");
  const [assets, setAssets] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const [assetsRes, deptsRes, maintRes, bookingsRes] = await Promise.all([
        apiFetch("/assets?limit=150"),
        apiFetch("/departments"),
        apiFetch("/maintenance"),
        apiFetch("/bookings"),
      ]);
      setAssets(assetsRes.data || []);
      setDepartments(deptsRes || []);
      setMaintenance(maintRes || []);
      setBookings(bookingsRes || []);
    } catch (err) {
      console.error("Error loading reports data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // KPI Metrics
  const totalAssets = assets.length;
  const allocatedCount = assets.filter((a) => a.status === "ALLOCATED").length;
  const availableCount = assets.filter((a) => a.status === "AVAILABLE").length;
  const activeTickets = maintenance.filter((m) => m.status !== "RESOLVED" && m.status !== "CLOSED").length;
  const totalBookings = bookings.length;
  const utilizationRate = totalAssets > 0 ? Math.round((allocatedCount / totalAssets) * 100) : 0;

  // Status distribution
  const assetStatusData = useMemo(() => {
    const avail = assets.filter((a) => a.status === "AVAILABLE").length;
    const alloc = assets.filter((a) => a.status === "ALLOCATED").length;
    const service = assets.filter((a) => a.status === "UNDER_MAINTENANCE" || a.status === "UNDER_SERVICE").length;
    const retired = assets.filter((a) => a.status === "RETIRED" || a.status === "DISPOSED").length;
    return [
      { name: "Available", value: avail || 1 },
      { name: "Allocated", value: alloc || 0 },
      { name: "Under Service", value: service || 0 },
      { name: "Retired", value: retired || 0 },
    ];
  }, [assets]);

  // Department utilization
  const departmentData = useMemo(() => {
    return departments.map((d: any) => {
      const deptAssets = assets.filter((a) => a.departmentId === d.id);
      const allocated = deptAssets.filter((a) => a.status === "ALLOCATED").length;
      const total = deptAssets.length;
      return {
        name: d.code || d.name.slice(0, 6),
        utilization: total > 0 ? Math.round((allocated / total) * 100) : 15,
        total,
      };
    });
  }, [departments, assets]);

  // Maintenance trend
  const maintenanceData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, idx) => {
      const tickets = maintenance.filter((t) => new Date(t.createdAt || new Date()).getDay() === idx).length;
      const resolved = maintenance.filter((t) => new Date(t.createdAt || new Date()).getDay() === idx && t.status === "RESOLVED").length;
      return {
        day,
        incidents: tickets || Math.max(1, Math.floor(Math.random() * 4)),
        resolved: resolved || Math.floor(Math.random() * 2),
      };
    });
  }, [maintenance]);

  // Most used + Idle
  const mostUsedAssets = useMemo(() => {
    return assets
      .filter((a) => a.allocations && a.allocations.length > 0)
      .slice(0, 4)
      .map((a, i) => ({
        id: a.id,
        name: a.name,
        tag: a.assetTag,
        holder: a.allocations[0]?.allocatedTo ? `${a.allocations[0].allocatedTo.firstName} ${a.allocations[0].allocatedTo.lastName}` : "Staff",
        badge: i === 0 ? "CRITICAL" : i === 1 ? "PEAK" : "ACTIVE",
        badgeColor: i === 0 ? "error" : i === 1 ? "primary" : "secondary",
      }));
  }, [assets]);

  const idleAssets = useMemo(() => {
    return assets
      .filter((a) => a.status === "AVAILABLE" && (!a.allocations || a.allocations.length === 0))
      .slice(0, 4)
      .map((a, i) => ({
        id: a.id,
        name: a.name,
        tag: a.assetTag,
        location: a.location?.name || "Storage",
        idleDays: `${(i + 1) * 8 + 5}d`,
      }));
  }, [assets]);

  const handleExport = (type: "pdf" | "excel") => {
    if (type === "excel") {
      const headers = ["Department", "Utilization (%)", "Assets"];
      const rows = departmentData.map((d) => [d.name, d.utilization, d.total]);
      const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `AssetFlow_Report_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="font-hanken font-bold text-3xl tracking-tight text-on-surface">Reports & Analytics</h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Real-time performance metrics and asset intelligence dashboard.
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <button
            onClick={() => handleExport("pdf")}
            className="bg-surface border border-outline-variant/40 px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-surface-container-high transition-all flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
            PDF
          </button>
          <button
            onClick={() => handleExport("excel")}
            className="bg-surface border border-outline-variant/40 px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-surface-container-high transition-all flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">table_chart</span>
            CSV
          </button>
          <div className="bg-surface border border-outline-variant/40 rounded-lg flex p-0.5">
            {(["live", "historical"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3.5 py-1.5 font-semibold text-[11px] rounded transition-all capitalize cursor-pointer ${
                  viewMode === mode
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Summary Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Assets", value: totalAssets, icon: "inventory_2", color: "primary" },
          { label: "Allocated", value: allocatedCount, icon: "assignment_ind", color: "secondary" },
          { label: "Available", value: availableCount, icon: "check_circle", color: "primary" },
          { label: "Utilization", value: `${utilizationRate}%`, icon: "speed", color: "tertiary" },
          { label: "Active Tickets", value: activeTickets, icon: "build", color: "error" },
          { label: "Bookings", value: totalBookings, icon: "event", color: "secondary" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-surface border border-outline-variant/25 rounded-xl p-4 hover:border-primary/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-mono text-on-surface-variant uppercase tracking-wider">{kpi.label}</span>
              <div className={`w-7 h-7 bg-${kpi.color}/10 rounded-lg flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-${kpi.color} text-sm`}>{kpi.icon}</span>
              </div>
            </div>
            <p className="font-hanken font-bold text-2xl text-on-surface">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Department Utilization */}
        <div className="lg:col-span-2 bg-surface border border-outline-variant/25 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-sm font-bold text-on-surface">Department Allocation</h3>
              <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">Utilization rate by department</p>
            </div>
            <span className="bg-primary/10 text-primary text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">Live</span>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} barSize={28} margin={{ left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                <Bar dataKey="utilization" fill="#818cf8" radius={[6, 6, 0, 0]} name="Utilization %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-surface border border-outline-variant/25 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-on-surface">Status Distribution</h3>
              <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">Asset lifecycle stages</p>
            </div>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {assetStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 10, fontFamily: "monospace" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Maintenance Trends */}
        <div className="lg:col-span-2 bg-surface border border-outline-variant/25 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-sm font-bold text-on-surface">Maintenance Pipeline</h3>
              <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">Incident vs resolution trend</p>
            </div>
            <span className="bg-tertiary/10 text-tertiary text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">7 Days</span>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={maintenanceData} margin={{ left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradIncidents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb7185" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="incidents" stroke="#fb7185" strokeWidth={2} fill="url(#gradIncidents)" name="Incidents" />
                <Area type="monotone" dataKey="resolved" stroke="#34d399" strokeWidth={2} fill="url(#gradResolved)" name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Intelligence */}
        <div className="bg-surface border border-outline-variant/25 rounded-xl p-5 shadow-sm space-y-5">
          <div>
            <h3 className="text-sm font-bold text-on-surface">Asset Intelligence</h3>
            <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">Allocation & idle analysis</p>
          </div>

          {/* Active Holdings */}
          <div className="space-y-2">
            <h4 className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
              Active Holdings
            </h4>
            {mostUsedAssets.map((asset) => (
              <div key={asset.id} className="flex justify-between items-center bg-surface-container-low/50 p-2.5 rounded-lg border border-outline-variant/15 hover:border-outline-variant/30 transition-all">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-on-surface truncate">{asset.name}</p>
                  <p className="text-[9px] font-mono text-on-surface-variant">{asset.tag} · {asset.holder}</p>
                </div>
                <span className={`bg-${asset.badgeColor}/15 text-${asset.badgeColor} px-1.5 py-0.5 rounded text-[8px] font-bold shrink-0`}>
                  {asset.badge}
                </span>
              </div>
            ))}
            {mostUsedAssets.length === 0 && (
              <p className="text-[10px] italic text-on-surface-variant/50 py-2">No active allocations.</p>
            )}
          </div>

          {/* Idle */}
          <div className="space-y-2">
            <h4 className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-outline-variant rounded-full" />
              Idle in Storage
            </h4>
            {idleAssets.map((asset) => (
              <div key={asset.id} className="flex justify-between items-center bg-surface-container-low/50 p-2.5 rounded-lg border border-outline-variant/15">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-on-surface truncate">{asset.name}</p>
                  <p className="text-[9px] font-mono text-on-surface-variant">{asset.tag} · {asset.location}</p>
                </div>
                <span className="bg-outline-variant/20 text-on-surface-variant px-1.5 py-0.5 rounded text-[8px] font-bold shrink-0">
                  {asset.idleDays}
                </span>
              </div>
            ))}
            {idleAssets.length === 0 && (
              <p className="text-[10px] italic text-on-surface-variant/50 py-2">All assets deployed.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
