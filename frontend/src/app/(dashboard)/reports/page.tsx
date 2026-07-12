/**
 * @module ReportsAnalytics
 * @description Analytics dashboard with Recharts (Bar, Area, Pie) and export tools.
 * @authors Developer 4
 * @status In-Progress
 * @collaboration Consumes analytics data from backend API endpoints
 */

"use client";

import React, { useState } from "react";
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

// --- Mock Data ---
interface AssetUsageItem {
  id: string;
  name: string;
  serial: string;
  imgUrl: string;
  usageHours: string;
  badge: string;
  badgeType: "peak" | "critical" | "active";
}

interface IdleAssetItem {
  id: string;
  name: string;
  serial: string;
  imgUrl: string;
  idleDays: string;
  badge: string;
}

const DEPARTMENT_DATA = [
  { name: "Logistics", utilization: 85, capacity: 100 },
  { name: "R&D", utilization: 62, capacity: 100 },
  { name: "Production", utilization: 94, capacity: 100 },
  { name: "IT Ops", utilization: 45, capacity: 100 },
  { name: "Quality", utilization: 78, capacity: 100 },
  { name: "Admin", utilization: 32, capacity: 100 },
];

const MAINTENANCE_DATA = [
  { day: "Jul 1", incidents: 3, resolved: 2 },
  { day: "Jul 3", incidents: 5, resolved: 4 },
  { day: "Jul 5", incidents: 2, resolved: 2 },
  { day: "Jul 7", incidents: 7, resolved: 5 },
  { day: "Jul 9", incidents: 4, resolved: 3 },
  { day: "Jul 11", incidents: 6, resolved: 6 },
  { day: "Jul 13", incidents: 3, resolved: 2 },
  { day: "Jul 15", incidents: 8, resolved: 7 },
  { day: "Jul 17", incidents: 5, resolved: 5 },
  { day: "Jul 19", incidents: 4, resolved: 3 },
  { day: "Jul 21", incidents: 6, resolved: 5 },
  { day: "Jul 23", incidents: 3, resolved: 3 },
  { day: "Jul 25", incidents: 9, resolved: 7 },
  { day: "Jul 27", incidents: 4, resolved: 4 },
  { day: "Jul 29", incidents: 5, resolved: 5 },
];

const ASSET_STATUS_DATA = [
  { name: "Available", value: 127, color: "#adc6ff" },
  { name: "Allocated", value: 95, color: "#b7c8e1" },
  { name: "Under Service", value: 18, color: "#ffb786" },
  { name: "Retired", value: 12, color: "#8c909f" },
];
const MOST_USED_ASSETS: AssetUsageItem[] = [
  {
    id: "1",
    name: "Unit AR-702",
    serial: "S/N: 99422-X",
    imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDBrCgGhQLBp-tAkAKzp5dQUGbRHsvo45NwQbtvfRFyKp04T2CVjHk_kxJajq-Eau95fgM-VGlydGJKkGnJhSuoJxftLTvLFLt9L4CVh2dTSy-43UtXVdDxixturWyWVEOHiodA64-OAahhgFuB-47kbqCcm_9ug0KSbw-NTooa5C3sfWrT6805UdxjziqGWjU-5DmbUxtkbJ4y1LL3Wi09Y45t_2wxFW1rJQ9VPhIeT1RmDJgR4l_i1MWM72-zr6y4MjQABW-IoMPL",
    usageHours: "18h/day",
    badge: "PEAK",
    badgeType: "peak",
  },
  {
    id: "2",
    name: "Server NV-12",
    serial: "S/N: 11043-L",
    imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAthX7MldMxA1Ryt3KFMrc6C6vq0B0clO-O7i0LOY3hIV2RxO2Dur3-Abpja2fGq0LDqUpHwoS7Inz6sGvtwTeGap3cOITyNdT82KMswc6GpxWxJ6OCljgDr0w_CSZ1nx0x3cG0xy0PuyDuVM8jepeynqygygXw3VBEnZltLXZQ9iXgD3DRIIhqWpojJuisLe0lCJq4aSsPPH_kbuAEKn8tyH9XL4Tdkx9NSrvP3Z-aTEjv4_eSGL0dfQSpJChTyR7cg9I8B87nySHQ",
    usageHours: "24h/day",
    badge: "CRITICAL",
    badgeType: "critical",
  },
  {
    id: "3",
    name: "Forklift T-9",
    serial: "S/N: 22819-B",
    imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB7kmIzTw0DskT6HUaQW2ZkZsRmw4i8xfH25G99mvT338cXw8p4LhqXfvEp0-tmANRIOMpLX80_CJVXHX1ld4XU8GnWWsXqxR0UEJ0SjZDpAQ1b0OYyH3XGxN-7p8rqnT-v7CK5rrzqgypzsNMZ92vDcw8PZp6O5ujnN0o7JIiXImc-M8ahvXZ2tHf6RUVnx96t8b3LCVOuLj_ajaKzo6rJSOXoNhM_rN27STWvUHsUhMhT_8_kh0qZMWOxtwSqlyKOdFy0VhfbY1fu",
    usageHours: "12h/day",
    badge: "ACTIVE",
    badgeType: "active",
  },
];

const IDLE_ASSETS: IdleAssetItem[] = [
  {
    id: "1",
    name: "Hangar Crane-F3",
    serial: "S/N: 88230-C",
    imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDBrCgGhQLBp-tAkAKzp5dQUGbRHsvo45NwQbtvfRFyKp04T2CVjHk_kxJajq-Eau95fgM-VGlydGJKkGnJhSuoJxftLTvLFLt9L4CVh2dTSy-43UtXVdDxixturWyWVEOHiodA64-OAahhgFuB-47kbqCcm_9ug0KSbw-NTooa5C3sfWrT6805UdxjziqGWjU-5DmbUxtkbJ4y1LL3Wi09Y45t_2wxFW1rJQ9VPhIeT1RmDJgR4l_i1MWM72-zr6y4MjQABW-IoMPL",
    idleDays: "45 days idle",
    badge: "EXCESS",
  },
  {
    id: "2",
    name: "Laser Cutter Z-1",
    serial: "S/N: 44021-M",
    imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAthX7MldMxA1Ryt3KFMrc6C6vq0B0clO-O7i0LOY3hIV2RxO2Dur3-Abpja2fGq0LDqUpHwoS7Inz6sGvtwTeGap3cOITyNdT82KMswc6GpxWxJ6OCljgDr0w_CSZ1nx0x3cG0xy0PuyDuVM8jepeynqygygXw3VBEnZltLXZQ9iXgD3DRIIhqWpojJuisLe0lCJq4aSsPPH_kbuAEKn8tyH9XL4Tdkx9NSrvP3Z-aTEjv4_eSGL0dfQSpJChTyR7cg9I8B87nySHQ",
    idleDays: "32 days idle",
    badge: "LOW DEMAND",
  },
];

// Custom tooltip styling
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card rounded-lg p-3 shadow-xl text-xs space-y-1">
      <p className="font-semibold text-on-surface">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="font-mono">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const [viewMode, setViewMode] = useState<"live" | "historical">("live");

  const handleExport = (type: "pdf" | "excel") => {
    if (type === "excel") {
      const headers = ["Department", "Utilization (%)", "Capacity (%)"];
      const rows = DEPARTMENT_DATA.map((d) => [d.name, d.utilization, d.capacity]);
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
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-hanken font-bold text-3xl tracking-tight text-on-surface">Reports & Analytics</h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Real-time performance metrics across enterprise assets.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {/* Export Buttons */}
          <button
            onClick={() => handleExport("pdf")}
            className="bg-surface-container border border-outline-variant px-4 py-2 rounded-lg text-xs font-semibold hover:bg-surface-container-high transition-all flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
            Export PDF
          </button>
          <button
            onClick={() => handleExport("excel")}
            className="bg-surface-container border border-outline-variant px-4 py-2 rounded-lg text-xs font-semibold hover:bg-surface-container-high transition-all flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-sm">table_chart</span>
            Export Excel
          </button>

          {/* View Mode Toggle */}
          <div className="bg-surface-container border border-outline-variant rounded flex p-1">
            <button
              onClick={() => setViewMode("live")}
              className={`px-4 py-1.5 font-semibold text-xs rounded transition-all ${
                viewMode === "live"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Live View
            </button>
            <button
              onClick={() => setViewMode("historical")}
              className={`px-4 py-1.5 font-semibold text-xs rounded transition-all ${
                viewMode === "historical"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Historical
            </button>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Chart: Utilization by Department (Bar) */}
        <div
          role="region"
          aria-label="Utilization by department bar chart"
          className="col-span-12 lg:col-span-7 bg-surface-container border border-outline-variant rounded-xl p-6"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-semibold text-lg text-on-surface">Utilization by Department</h3>
              <p className="text-on-surface-variant text-[10px] font-mono uppercase tracking-wider mt-1">
                Current Allocation vs Capacity
              </p>
            </div>
            <button className="p-1 hover:bg-surface-container-high rounded transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">more_vert</span>
            </button>
          </div>

          {/* --- START: Dev 4 — Recharts Bar Chart replacing SVG ---  */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPARTMENT_DATA} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#424754" strokeOpacity={0.3} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#8c909f", fontSize: 11, fontWeight: 600 }}
                  axisLine={{ stroke: "#424754" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#8c909f", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(173,198,255,0.05)" }} />
                <Bar
                  dataKey="utilization"
                  fill="#adc6ff"
                  radius={[6, 6, 0, 0]}
                  name="Utilization %"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* --- END: Dev 4 — Recharts Bar Chart --- */}
        </div>

        {/* KPI Grid */}
        <div className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-4">
          <button className="bg-surface-container border border-outline-variant rounded-xl p-4 flex flex-col justify-between text-left hover:border-primary/50 transition-all active:scale-[0.98]">
            <div className="w-10 h-10 rounded bg-primary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">speed</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-semibold text-[10px] uppercase tracking-wider">AVG UTILIZATION</p>
              <h4 className="font-bold text-2xl text-on-surface mt-1">78.4%</h4>
              <div className="flex items-center gap-1 text-secondary mt-1 text-xs">
                <span className="material-symbols-outlined text-sm">arrow_upward</span>
                <span>+4.2%</span>
              </div>
            </div>
          </button>

          <button className="bg-surface-container border border-outline-variant rounded-xl p-4 flex flex-col justify-between text-left hover:border-error/50 transition-all active:scale-[0.98]">
            <div className="w-10 h-10 rounded bg-tertiary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary">warning</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-semibold text-[10px] uppercase tracking-wider">CRITICAL ALERTS</p>
              <h4 className="font-bold text-2xl text-on-surface mt-1">12</h4>
              <div className="flex items-center gap-1 text-error mt-1 text-xs">
                <span className="material-symbols-outlined text-sm">priority_high</span>
                <span>Action Required</span>
              </div>
            </div>
          </button>

          <button className="bg-surface-container border border-outline-variant rounded-xl p-4 flex flex-col justify-between text-left hover:border-secondary/50 transition-all active:scale-[0.98]">
            <div className="w-10 h-10 rounded bg-secondary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary">monetization_on</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-semibold text-[10px] uppercase tracking-wider">EST. COST SAVING</p>
              <h4 className="font-bold text-2xl text-on-surface mt-1">$14.2k</h4>
              <span className="text-on-surface-variant text-xs mt-1 block">This Quarter</span>
            </div>
          </button>

          <button className="bg-surface-container border border-outline-variant rounded-xl p-4 flex flex-col justify-between text-left hover:border-primary/50 transition-all active:scale-[0.98]">
            <div className="w-10 h-10 rounded bg-surface-container-highest flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface">history</span>
            </div>
            <div>
              <p className="text-on-surface-variant font-semibold text-[10px] uppercase tracking-wider">UPTIME SCORE</p>
              <h4 className="font-bold text-2xl text-on-surface mt-1">99.2%</h4>
              <span className="text-secondary text-xs mt-1 block">Target: 98%</span>
            </div>
          </button>
        </div>

        {/* Maintenance Frequency (Area Chart) */}
        <div
          role="region"
          aria-label="Maintenance frequency area chart"
          className="col-span-12 lg:col-span-8 bg-surface-container border border-outline-variant rounded-xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-semibold text-lg text-on-surface">Maintenance Frequency</h3>
              <p className="text-on-surface-variant text-[10px] font-mono uppercase tracking-wider mt-1">
                Incidents over last 30 days
              </p>
            </div>
            <button
              onClick={() => alert("Filtering Maintenance Analytics")}
              className="bg-surface-container-high border border-outline-variant px-4 py-1.5 rounded text-xs font-semibold hover:bg-surface-bright transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
              Filter by Type
            </button>
          </div>

          {/* --- START: Dev 4 — Recharts Area Chart replacing SVG --- */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MAINTENANCE_DATA}>
                <defs>
                  <linearGradient id="incidentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#adc6ff" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#adc6ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b7c8e1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#b7c8e1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#424754" strokeOpacity={0.3} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#8c909f", fontSize: 10 }}
                  axisLine={{ stroke: "#424754" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#8c909f", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="incidents"
                  stroke="#adc6ff"
                  strokeWidth={2}
                  fill="url(#incidentGrad)"
                  name="Incidents"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stroke="#b7c8e1"
                  strokeWidth={2}
                  fill="url(#resolvedGrad)"
                  name="Resolved"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* --- END: Dev 4 — Recharts Area Chart --- */}
        </div>

        {/* Asset Status Pie Chart */}
        <div
          role="region"
          aria-label="Asset status allocation pie chart"
          className="col-span-12 lg:col-span-4 bg-surface-container border border-outline-variant rounded-xl p-6"
        >
          <div className="mb-4">
            <h3 className="font-semibold text-lg text-on-surface">Asset Status Split</h3>
            <p className="text-on-surface-variant text-[10px] font-mono uppercase tracking-wider mt-1">
              Current Distribution
            </p>
          </div>

          {/* --- START: Dev 4 — Recharts Pie Chart --- */}
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ASSET_STATUS_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {ASSET_STATUS_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-on-surface-variant text-xs">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* --- END: Dev 4 — Recharts Pie Chart --- */}

          {/* Status breakdown list */}
          <div className="space-y-2 mt-4 border-t border-outline-variant pt-4">
            {ASSET_STATUS_DATA.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-on-surface-variant">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-on-surface">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Rail: Performance Lists */}
        <div className="col-span-12 flex flex-col lg:flex-row gap-4">
          {/* Most Used Assets */}
          <div className="bg-surface-container border border-outline-variant rounded-xl p-4 flex-1">
            <div className="flex justify-between items-center mb-4 border-b border-outline-variant pb-2">
              <h4 className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">Most Used Assets</h4>
              <button
                onClick={() => alert("Showing all high utilization assets")}
                className="text-primary text-[10px] font-bold uppercase hover:underline"
              >
                See All
              </button>
            </div>
            
            <div className="space-y-3">
              {MOST_USED_ASSETS.map((item) => (
                <div
                  key={item.id}
                  onClick={() => alert(`Viewing details for ${item.name}`)}
                  className="flex items-center gap-3 p-2 hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-outline-variant bg-surface-container-highest shrink-0">
                    <img alt={item.name} className="w-full h-full object-cover" src={item.imgUrl} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-on-surface truncate">{item.name}</p>
                    <p className="font-mono text-[10px] text-on-surface-variant">{item.serial}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-xs text-primary font-bold">{item.usageHours}</p>
                    <span className={`inline-block px-1.5 py-0.5 text-[8px] font-bold rounded mt-0.5 ${
                      item.badgeType === "critical"
                        ? "bg-error/15 text-error"
                        : item.badgeType === "peak"
                        ? "bg-tertiary-container/20 text-tertiary"
                        : "bg-primary-container/20 text-primary"
                    }`}>
                      {item.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Idle Assets */}
          <div className="bg-surface-container border border-outline-variant rounded-xl p-4 flex-1">
            <div className="flex justify-between items-center mb-4 border-b border-outline-variant pb-2">
              <h4 className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">Idle Assets</h4>
              <button
                onClick={() => alert("Showing all underutilized assets")}
                className="text-primary text-[10px] font-bold uppercase hover:underline"
              >
                See All
              </button>
            </div>

            <div className="space-y-3">
              {IDLE_ASSETS.map((item) => (
                <div
                  key={item.id}
                  onClick={() => alert(`Viewing details for ${item.name}`)}
                  className="flex items-center gap-3 p-2 hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-outline-variant bg-surface-container-highest shrink-0">
                    <img alt={item.name} className="w-full h-full object-cover" src={item.imgUrl} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-on-surface truncate">{item.name}</p>
                    <p className="font-mono text-[10px] text-on-surface-variant">{item.serial}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-xs text-tertiary font-bold">{item.idleDays}</p>
                    <span className="inline-block px-1.5 py-0.5 bg-surface-variant text-on-surface-variant text-[8px] font-bold rounded mt-0.5">
                      {item.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
