"use client";


/**
 * @module AssetsPage
 * @description Asset directory view with filter bar, status badges, and deep-link routing.
 *              Clicking a row routes to /assets/[id].
 * @authors Developer 3
 * @status In-Progress (mock data; awaiting GET /api/assets from Backend Developer A)
 * @collaboration Backend Developer A: GET /api/assets (paginated)
 */

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Asset, AssetStatus } from "@/types/api";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_ASSETS: Asset[] = [
  {
    id: "1",
    tag: "AF-0001",
    name: "MacBook Pro 14\"",
    category: "Laptops",
    status: "Allocated",
    currentHolder: "Priya Shah",
    location: "IT Floor – Desk 12",
    serialNumber: "C02X1234HV2N",
  },
  {
    id: "2",
    tag: "AF-0002",
    name: "ThinkPad X1 Carbon",
    category: "Laptops",
    status: "Available",
    currentHolder: undefined,
    location: "Storage Room A",
    serialNumber: "PF2Y0089KL",
  },
  {
    id: "3",
    tag: "AF-0003",
    name: 'Dell UltraSharp 27"',
    category: "Monitors",
    status: "Allocated",
    currentHolder: "Rahul Mehta",
    location: "IT Floor – Desk 01",
    serialNumber: "CN04Y6G7839DL",
  },
  {
    id: "4",
    tag: "AF-0004",
    name: "Epson Projector EB-X51",
    category: "Projectors",
    status: "Maintenance",
    currentHolder: undefined,
    location: "Maintenance Bay",
    serialNumber: "EPSXB451090",
  },
  {
    id: "5",
    tag: "AF-0005",
    name: "iPhone 14 Pro",
    category: "Smartphones",
    status: "Allocated",
    currentHolder: "Anjali Verma",
    location: "HR Department",
    serialNumber: "F5RK2029JL3N",
  },
  {
    id: "6",
    tag: "AF-0006",
    name: "Cisco Catalyst 2960",
    category: "Switches",
    status: "Available",
    currentHolder: undefined,
    location: "Server Room",
    serialNumber: "FHH1230P07K",
  },
  {
    id: "7",
    tag: "AF-0007",
    name: "Office Chair — Ergonomic",
    category: "Chairs",
    status: "Allocated",
    currentHolder: "Meera Pillai",
    location: "Operations Floor",
    serialNumber: undefined,
  },
  {
    id: "8",
    tag: "AF-0008",
    name: "iPad Pro 12.9\"",
    category: "Tablets",
    status: "Retired",
    currentHolder: undefined,
    location: "Retired Assets Store",
    serialNumber: "DLXK7023AM",
  },
  {
    id: "9",
    tag: "AF-0009",
    name: "HP LaserJet Pro",
    category: "Printers",
    status: "Available",
    currentHolder: undefined,
    location: "Office Floor 2",
    serialNumber: "CNB9J00012",
  },
  {
    id: "10",
    tag: "AF-0010",
    name: "Dell PowerEdge R740",
    category: "Servers",
    status: "Maintenance",
    currentHolder: undefined,
    location: "Data Center",
    serialNumber: "DELLPE74X0010",
  },
];

const ALL_CATEGORIES = Array.from(new Set(MOCK_ASSETS.map((a) => a.category)));
const ALL_LOCATIONS = Array.from(new Set(MOCK_ASSETS.map((a) => a.location)));
const ALL_STATUSES: AssetStatus[] = [
  "Available",
  "Allocated",
  "Maintenance",
  "Retired",
  "Lost",
];

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<AssetStatus, string> = {
  Available: "bg-primary/10 text-primary border-primary/20",
  Allocated: "bg-secondary/10 text-secondary border-secondary/20",
  Maintenance: "bg-tertiary/10 text-tertiary border-tertiary/20",
  Retired: "bg-outline-variant/30 text-on-surface-variant border-outline-variant",
  Lost: "bg-error-container/20 text-error border-error/20",
};

function StatusBadge({ status }: { status: AssetStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${STATUS_STYLES[status]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AssetsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filtered = useMemo(() => {
    return MOCK_ASSETS.filter((a) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        a.tag.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        (a.serialNumber?.toLowerCase().includes(q) ?? false);
      const matchesCat = !filterCategory || a.category === filterCategory;
      const matchesLoc = !filterLocation || a.location === filterLocation;
      const matchesStatus = !filterStatus || a.status === filterStatus;
      return matchesSearch && matchesCat && matchesLoc && matchesStatus;
    });
  }, [search, filterCategory, filterLocation, filterStatus]);

  const hasFilters = search || filterCategory || filterLocation || filterStatus;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-hanken font-bold text-3xl tracking-tight text-on-surface">
            Asset Directory
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            {filtered.length} of {MOCK_ASSETS.length} assets
          </p>
        </div>
        <Link
          href="/assets/new"
          id="register-asset-btn"
          className="bg-primary text-on-primary font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wide hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Register Asset
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="glass-card rounded-xl p-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
            search
          </span>
          <input
            id="asset-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Tag, Serial, or Name..."
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>

        {/* Category Filter */}
        <select
          id="filter-category"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-pointer"
        >
          <option value="">All Categories</option>
          {ALL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Location Filter */}
        <select
          id="filter-location"
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-pointer"
        >
          <option value="">All Locations</option>
          {ALL_LOCATIONS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          id="filter-status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-pointer"
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={() => {
              setSearch("");
              setFilterCategory("");
              setFilterLocation("");
              setFilterStatus("");
            }}
            className="text-xs text-on-surface-variant hover:text-on-surface flex items-center gap-1 transition-colors px-2 py-2"
          >
            <span className="material-symbols-outlined text-sm">close</span>
            Clear
          </button>
        )}
      </div>

      {/* Asset Table */}
      <div className="glass-card rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container/50">
                <th className="text-left px-6 py-3.5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
                  Asset Tag
                </th>
                <th className="text-left px-6 py-3.5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
                  Name & Category
                </th>
                <th className="text-left px-6 py-3.5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
                  Status
                </th>
                <th className="text-left px-6 py-3.5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
                  Current Holder
                </th>
                <th className="text-left px-6 py-3.5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
                  Location
                </th>
                <th className="px-6 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span
                        className="material-symbols-outlined text-4xl text-on-surface-variant/30"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        inventory_2
                      </span>
                      <p className="text-on-surface-variant text-sm">
                        No assets match your filters.
                      </p>
                      <button
                        onClick={() => {
                          setSearch("");
                          setFilterCategory("");
                          setFilterLocation("");
                          setFilterStatus("");
                        }}
                        className="text-primary text-xs hover:underline"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((asset) => (
                  <tr
                    key={asset.id}
                    id={`asset-row-${asset.id}`}
                    onClick={() => router.push(`/assets/${asset.id}`)}
                    className="hover:bg-surface-container-high/30 transition-all cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-surface-container px-2.5 py-1.5 rounded text-primary font-semibold tracking-wider">
                        {asset.tag}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-on-surface group-hover:text-primary transition-colors">
                        {asset.name}
                      </div>
                      <div className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[11px]">
                          category
                        </span>
                        {asset.category}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="px-6 py-4">
                      {asset.currentHolder ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-[10px] font-bold text-secondary shrink-0">
                            {asset.currentHolder.charAt(0)}
                          </div>
                          <span className="text-on-surface-variant text-sm">
                            {asset.currentHolder}
                          </span>
                        </div>
                      ) : (
                        <span className="text-on-surface-variant/40 text-xs italic">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-on-surface-variant text-sm flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-xs">
                          location_on
                        </span>
                        {asset.location}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="material-symbols-outlined text-on-surface-variant/30 group-hover:text-primary transition-colors text-lg">
                        arrow_forward_ios
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-3 border-t border-outline-variant/30 flex items-center justify-between bg-surface-container/20">
          <span className="text-xs text-on-surface-variant font-mono">
            Showing {filtered.length} of {MOCK_ASSETS.length} assets
          </span>
          <div className="flex items-center gap-4 text-xs text-on-surface-variant font-mono">
            {ALL_STATUSES.filter((s) =>
              MOCK_ASSETS.some((a) => a.status === s)
            ).map((s) => (
              <span key={s} className="flex items-center gap-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full bg-current ${
                    s === "Available"
                      ? "text-primary"
                      : s === "Allocated"
                      ? "text-secondary"
                      : s === "Maintenance"
                      ? "text-tertiary"
                      : s === "Retired"
                      ? "text-outline"
                      : "text-error"
                  }`}
                />
                {MOCK_ASSETS.filter((a) => a.status === s).length} {s}
              </span>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
