"use client";

import React, { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useWebsockets } from "@/hooks/useWebsockets";
import type { Asset, AssetStatus } from "@/types/api";

// ─── Status Badge mapping ─────────────────────────────────────────────────────

const STATUS_STYLES: Record<AssetStatus, string> = {
  Available: "bg-success/10 text-success border-success/25",
  Allocated: "bg-info/10 text-info border-info/25",
  Maintenance: "bg-warning/10 text-warning border-warning/25",
  Retired: "bg-outline-variant/30 text-on-surface-variant border-outline-variant",
  Lost: "bg-error/10 text-error border-error/25",
};

const mapStatusToFront = (status: string): AssetStatus => {
  if (status === "AVAILABLE") return "Available";
  if (status === "ALLOCATED") return "Allocated";
  if (status === "UNDER_MAINTENANCE") return "Maintenance";
  if (status === "RETIRED") return "Retired";
  return "Lost";
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

function AssetsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  const [search, setSearch] = useState(queryParam);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const loadFilters = async () => {
    try {
      const cats = await apiFetch("/categories");
      setCategories(cats);
      const locs = await apiFetch("/assets/locations");
      setLocations(locs);
    } catch (err) {
      console.error("Error loading filters:", err);
    }
  };

  const loadAssets = useCallback(async () => {
    try {
      // Map frontend status to backend status enum
      let statusParam = "";
      if (filterStatus === "Available") statusParam = "AVAILABLE";
      if (filterStatus === "Allocated") statusParam = "ALLOCATED";
      if (filterStatus === "Maintenance") statusParam = "UNDER_MAINTENANCE";
      if (filterStatus === "Retired") statusParam = "RETIRED";
      if (filterStatus === "Lost") statusParam = "LOST";

      const queryObj: Record<string, string> = {};
      if (search) queryObj.search = search;
      if (filterCategory) queryObj.categoryId = filterCategory;
      if (filterLocation) queryObj.locationId = filterLocation;
      if (statusParam) queryObj.status = statusParam;
      queryObj.limit = "100";

      const queryString = new URLSearchParams(queryObj).toString();
      const res = await apiFetch(`/assets?${queryString}`);

      const mapped = res.data.map((asset: any) => ({
        id: asset.id,
        tag: asset.assetTag,
        name: asset.name,
        category: asset.category?.name || "",
        status: mapStatusToFront(asset.status),
        currentHolder: asset.allocations && asset.allocations.length > 0
          ? `${asset.allocations[0].allocatedTo?.firstName} ${asset.allocations[0].allocatedTo?.lastName}`
          : undefined,
        location: asset.location?.name || "",
        serialNumber: asset.serialNumber || undefined,
        description: asset.description || undefined,
      }));

      setAssets(mapped);
    } catch (err) {
      console.error("Error loading assets:", err);
    }
  }, [search, filterCategory, filterLocation, filterStatus]);

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  // Real-time synchronization
  useWebsockets({
    onDashboardRefresh: () => {
      loadAssets();
    },
  });

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
            {assets.length} assets registered in directory
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
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
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
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
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
          <option value="Available">Available</option>
          <option value="Allocated">Allocated</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Retired">Retired</option>
          <option value="Lost">Lost</option>
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
              {assets.length === 0 ? (
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
                assets.map((asset) => (
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
            Showing {assets.length} assets
          </span>
        </div>
      </div>

    </div>
  );
}

export default function AssetsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-on-surface-variant font-mono">Loading assets...</div>}>
      <AssetsList />
    </Suspense>
  );
}
