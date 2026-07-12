"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { AssetStatus } from "@/types/api";

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
  if (status === "UNDER_MAINTENANCE" || status === "UNDER_SERVICE") return "Maintenance";
  if (status === "RETIRED") return "Retired";
  return "Lost";
};

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4 py-3 border-b border-outline-variant/30 last:border-0">
      <span className="text-xs font-mono text-on-surface-variant uppercase tracking-wider w-32 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-sm text-on-surface font-medium">{value}</span>
    </div>
  );
}

export default function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [asset, setAsset] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAsset = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch(`/assets/${id}`);
      setAsset(res);
    } catch (err: any) {
      console.error("Error loading asset:", err);
      setError(err.message || "Failed to load asset details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAsset();
  }, [loadAsset]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-on-surface-variant font-mono text-sm">
        <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
        Loading asset details...
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="glass-card rounded-2xl p-8 shadow-2xl text-center space-y-4 max-w-md mx-auto">
        <div className="w-14 h-14 bg-error/10 rounded-2xl flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-error text-3xl">error</span>
        </div>
        <h2 className="font-hanken font-bold text-xl text-on-surface">Asset Not Found</h2>
        <p className="text-on-surface-variant text-sm">
          {error || "The requested asset record does not exist or has been deleted."}
        </p>
        <Link
          href="/assets"
          className="inline-block bg-primary text-on-primary font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-wider hover:brightness-110 transition-all"
        >
          Back to Directory
        </Link>
      </div>
    );
  }

  const frontStatus = mapStatusToFront(asset.status);
  const activeAllocation = asset.allocations?.find((al: any) => al.status === "ACTIVE");
  const currentHolder = activeAllocation?.allocatedTo
    ? `${activeAllocation.allocatedTo.firstName} ${activeAllocation.allocatedTo.lastName}`
    : null;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-on-surface-variant">
        <Link href="/assets" className="hover:text-primary transition-colors">
          Asset Directory
        </Link>
        <span className="material-symbols-outlined text-xs">
          chevron_right
        </span>
        <span className="text-on-surface font-semibold">{asset.assetTag}</span>
      </nav>

      {/* Header Card */}
      <div className="glass-card rounded-2xl p-6 shadow-lg bg-surface">
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
            <span
              className="material-symbols-outlined text-primary text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              inventory_2
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-xs bg-surface-container px-2.5 py-1.5 rounded text-primary font-semibold tracking-wider">
                {asset.assetTag}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                  STATUS_STYLES[frontStatus]
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                {frontStatus}
              </span>
            </div>
            <h1 className="font-hanken font-bold text-2xl text-on-surface mt-2">
              {asset.name}
            </h1>
            <p className="text-on-surface-variant text-sm flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-xs">category</span>
              {asset.category?.name || "Uncategorized"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 shrink-0">
            <Link
              href={`/assets?q=${encodeURIComponent(asset.assetTag)}`}
              className="bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high font-semibold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-sm">
                arrow_back
              </span>
              Back
            </Link>
          </div>
        </div>

        {asset.description && (
          <p className="mt-4 text-sm text-on-surface-variant leading-relaxed border-t border-outline-variant/30 pt-4">
            {asset.description}
          </p>
        )}
      </div>

      {/* Details Card */}
      <div className="glass-card rounded-2xl p-6 shadow-lg bg-surface">
        <h2 className="text-xs font-mono text-on-surface-variant font-bold tracking-widest mb-4">
          ASSET DETAILS
        </h2>
        <div>
          <InfoRow label="Serial No." value={asset.serialNumber} />
          <InfoRow label="Category" value={asset.category?.name || "Uncategorized"} />
          <InfoRow label="Location" value={asset.location?.name || "Storage"} />
          <InfoRow label="Holder" value={currentHolder || "Unassigned"} />
          <InfoRow
            label="Purchased"
            value={
              asset.purchaseDate
                ? new Date(asset.purchaseDate).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : undefined
            }
          />
          <InfoRow label="Status" value={frontStatus} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Allocate", icon: "assignment_ind", color: "text-primary", link: `/allocation?q=${asset.assetTag}` },
          { label: "Maintenance", icon: "build", color: "text-tertiary", link: `/maintenance?q=${asset.assetTag}` },
          { label: "Retire", icon: "delete_forever", color: "text-error", link: `/assets` },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.link}
            className="glass-card rounded-xl p-4 flex flex-col items-center gap-2 hover:border-outline transition-all group bg-surface text-center"
          >
            <span
              className={`material-symbols-outlined text-2xl ${action.color} group-hover:scale-110 transition-transform`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {action.icon}
            </span>
            <span className="text-xs font-semibold text-on-surface-variant group-hover:text-on-surface transition-colors">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
