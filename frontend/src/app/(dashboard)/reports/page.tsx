"use client";

import React, { useState } from "react";

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

export default function ReportsPage() {
  const [viewMode, setViewMode] = useState<"live" | "historical">("live");

  const filterByDept = (dept: string) => {
    alert(`Filtering analytics dashboard by ${dept} Department`);
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
        <div className="flex gap-2">
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
          className="col-span-12 lg:col-span-7 bg-surface-container border border-outline-variant rounded-xl p-6 relative overflow-hidden"
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

          {/* Simple Dynamic SVG Bar Chart */}
          <div className="h-64 flex items-end gap-3 px-4 pb-4 select-none">
            {[
              { name: "Logistics", pct: "85%" },
              { name: "R&D", pct: "62%" },
              { name: "Production", pct: "94%" },
              { name: "IT Ops", pct: "45%" },
              { name: "Quality", pct: "78%" },
              { name: "Admin", pct: "32%" },
            ].map((dept) => (
              <div
                key={dept.name}
                onClick={() => filterByDept(dept.name)}
                className="flex-1 flex flex-col gap-2 group cursor-pointer"
                title={`View ${dept.name} Details`}
              >
                <div className="relative w-full bg-surface-container-highest rounded-t-lg overflow-hidden h-40">
                  <div
                    className="absolute bottom-0 w-full bg-primary transition-all duration-500 group-hover:brightness-110"
                    style={{ height: dept.pct }}
                  ></div>
                </div>
                <span className="text-center font-semibold text-xs text-on-surface-variant group-hover:text-primary transition-colors">
                  {dept.name}
                </span>
              </div>
            ))}
          </div>
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

        {/* Maintenance Frequency (Line Chart) */}
        <div
          role="region"
          aria-label="Maintenance frequency line chart"
          className="col-span-12 lg:col-span-8 bg-surface-container border border-outline-variant rounded-xl p-6 relative overflow-hidden min-h-[400px]"
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

          {/* SVG Line Chart */}
          <div className="absolute inset-0 top-32 px-6 pb-6">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#adc6ff" stopOpacity="0.15"></stop>
                  <stop offset="100%" stopColor="#adc6ff" stopOpacity="0"></stop>
                </linearGradient>
              </defs>
              <path
                d="M 0 160 Q 150 110 300 130 T 600 50 T 900 80 T 1200 30"
                fill="transparent"
                stroke="#adc6ff"
                strokeWidth="3"
                className="transition-all duration-500"
              ></path>
              <path
                d="M 0 160 Q 150 110 300 130 T 600 50 T 900 80 T 1200 30 L 1200 300 L 0 300 Z"
                fill="url(#lineGrad)"
              ></path>
            </svg>
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-b border-outline-variant opacity-10">
              <div className="border-t border-outline-variant w-full h-px"></div>
              <div className="border-t border-outline-variant w-full h-px"></div>
              <div className="border-t border-outline-variant w-full h-px"></div>
            </div>
          </div>
        </div>

        {/* Right Rail: Performance Lists */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
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
