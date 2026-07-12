"use client";

/**
 * @module AssetDetailPage
 * @description Asset detail view — shows all information for a single asset.
 *              Reached via deep-link from /assets table rows.
 * @authors Developer 3
 * @status In-Progress (mock data; awaiting GET /api/assets/:id from Backend Developer A)
 */

import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Asset, AssetStatus } from "@/types/api";

// ─── Mock Data (mirrors what /assets page uses) ───────────────────────────────

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
    purchaseDate: "2024-03-15",
    description:
      "Apple MacBook Pro 14-inch with M3 Pro chip. Allocated to the IT department lead.",
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
    purchaseDate: "2023-11-08",
    description: "Lenovo ThinkPad X1 Carbon Gen 11. Available for allocation.",
  },
  {
    id: "3",
    tag: "AF-0003",
    name: "Dell UltraSharp 27\"",
    category: "Monitors",
    status: "Allocated",
    currentHolder: "Rahul Mehta",
    location: "IT Floor – Desk 01",
    serialNumber: "CN04Y6G7839DL",
    purchaseDate: "2024-01-20",
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
    purchaseDate: "2022-06-30",
    description: "Sent for servicing — lamp replacement required.",
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
    purchaseDate: "2023-09-15",
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
    purchaseDate: "2021-04-10",
  },
  {
    id: "7",
    tag: "AF-0007",
    name: "Office Chair — Ergonomic",
    category: "Chairs",
    status: "Allocated",
    currentHolder: "Meera Pillai",
    location: "Operations Floor",
    purchaseDate: "2023-07-01",
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
    purchaseDate: "2020-11-01",
    description: "End-of-life. Battery swollen — decommissioned.",
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
    purchaseDate: "2022-12-05",
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
    purchaseDate: "2021-08-20",
    description: "Scheduled maintenance — RAID array check.",
  },
];

const STATUS_STYLES: Record<AssetStatus, string> = {
  Available: "bg-primary/10 text-primary border-primary/20",
  Allocated: "bg-secondary/10 text-secondary border-secondary/20",
  Maintenance: "bg-tertiary/10 text-tertiary border-tertiary/20",
  Retired: "bg-outline-variant/30 text-on-surface-variant border-outline-variant",
  Lost: "bg-error-container/20 text-error border-error/20",
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
  params: { id: string };
}) {
  const asset = MOCK_ASSETS.find((a) => a.id === params.id);

  if (!asset) {
    notFound();
  }

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
        <span className="text-on-surface font-semibold">{asset.tag}</span>
      </nav>

      {/* Header Card */}
      <div className="glass-card rounded-2xl p-6 shadow-lg">
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
                {asset.tag}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                  STATUS_STYLES[asset.status]
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                {asset.status}
              </span>
            </div>
            <h1 className="font-hanken font-bold text-2xl text-on-surface mt-2">
              {asset.name}
            </h1>
            <p className="text-on-surface-variant text-sm flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-xs">category</span>
              {asset.category}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 shrink-0">
            <button
              className="bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high font-semibold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all"
              title="Edit asset"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Edit
            </button>
            <Link
              href="/assets"
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
      <div className="glass-card rounded-2xl p-6 shadow-lg">
        <h2 className="text-xs font-mono text-on-surface-variant font-bold tracking-widest mb-4">
          ASSET DETAILS
        </h2>
        <div>
          <InfoRow label="Serial No." value={asset.serialNumber} />
          <InfoRow label="Category" value={asset.category} />
          <InfoRow label="Location" value={asset.location} />
          <InfoRow label="Holder" value={asset.currentHolder || "Unassigned"} />
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
          <InfoRow label="Status" value={asset.status} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Allocate", icon: "assignment_ind", color: "text-primary" },
          { label: "Maintenance", icon: "build", color: "text-tertiary" },
          { label: "Retire", icon: "delete_forever", color: "text-error" },
        ].map((action) => (
          <button
            key={action.label}
            className="glass-card rounded-xl p-4 flex flex-col items-center gap-2 hover:border-outline transition-all group"
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
          </button>
        ))}
      </div>
    </div>
  );
}
