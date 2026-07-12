"use client";

/**
 * @module NewAssetPage
 * @description Register a new asset form.
 *              Validates all required fields and posts to POST /api/assets.
 * @authors Developer 3
 * @status In-Progress (mock submit, awaiting Backend Developer A)
 */

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const newAssetSchema = z.object({
  name: z.string().min(2, "Asset name is required"),
  category: z.string().min(1, "Category is required"),
  serialNumber: z.string().optional(),
  location: z.string().min(2, "Location is required"),
  purchaseDate: z.string().optional(),
  description: z.string().optional(),
});

type NewAssetForm = z.infer<typeof newAssetSchema>;

const CATEGORIES = [
  "Laptops",
  "Monitors",
  "Mobile Devices",
  "Tablets",
  "Projectors",
  "Printers",
  "Servers",
  "Networking Equipment",
  "Furniture",
  "Software Licenses",
  "Other",
];

const LOCATIONS = [
  "Storage Room A",
  "Storage Room B",
  "IT Floor – Desk",
  "HR Department",
  "Finance Department",
  "Operations Floor",
  "Server Room",
  "Data Center",
  "Conference Room",
  "Maintenance Bay",
];

function FormField({
  id,
  label,
  required,
  error,
  children,
  hint,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1"
      >
        {label}
        {required && <span className="text-error text-xs">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-error text-xs flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">
            error_outline
          </span>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-on-surface-variant/60 text-[11px]">{hint}</p>
      )}
    </div>
  );
}

const inputClass =
  "w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all focus:ring-2 focus:ring-primary/50 focus:border-primary";
const inputErrorClass =
  "w-full bg-surface-container-low border border-error rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none ring-1 ring-error/30 transition-all focus:ring-2 focus:ring-primary/50 focus:border-primary";

export default function NewAssetPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedTag, setGeneratedTag] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewAssetForm>({ resolver: zodResolver(newAssetSchema) });

  const onSubmit = async (data: NewAssetForm) => {
    // TODO: replace with real API
    // const res = await fetch('/api/assets', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });

    await new Promise((r) => setTimeout(r, 1000));
    const mockTag = `AF-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    console.log("New asset payload:", { ...data, tag: mockTag, status: "Available" });
    setGeneratedTag(mockTag);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="glass-card rounded-2xl p-8 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <span
              className="material-symbols-outlined text-primary text-4xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              inventory_2
            </span>
          </div>
          <div>
            <h2 className="font-hanken font-bold text-xl text-on-surface">
              Asset Registered!
            </h2>
            <p className="text-on-surface-variant text-sm mt-2">
              Your asset has been successfully registered.
            </p>
          </div>
          <div className="bg-surface-container border border-outline-variant rounded-xl px-6 py-4">
            <p className="text-xs text-on-surface-variant font-mono uppercase tracking-widest mb-1">
              Asset Tag
            </p>
            <p className="font-mono font-bold text-2xl text-primary">
              {generatedTag}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/assets"
              className="flex-1 bg-surface-container border border-outline-variant text-on-surface font-bold py-3 rounded-lg text-sm hover:bg-surface-container-high transition-all text-center"
            >
              View Directory
            </Link>
            <Link
              href="/assets/new"
              onClick={() => setIsSuccess(false)}
              className="flex-1 bg-primary text-on-primary font-bold py-3 rounded-lg text-sm hover:brightness-110 transition-all text-center"
            >
              Register Another
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-on-surface-variant">
        <Link href="/assets" className="hover:text-primary transition-colors">
          Asset Directory
        </Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-on-surface font-semibold">Register New Asset</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="font-hanken font-bold text-3xl tracking-tight text-on-surface">
          Register New Asset
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Fill in the details below to add an asset to the registry.
        </p>
      </div>

      {/* Form */}
      <div className="glass-card rounded-2xl p-6 shadow-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Asset Name */}
          <FormField
            id="asset-name"
            label="Asset Name"
            required
            error={errors.name?.message}
          >
            <input
              id="asset-name"
              {...register("name")}
              placeholder='e.g. MacBook Pro 14"'
              className={errors.name ? inputErrorClass : inputClass}
            />
          </FormField>

          {/* Category & Serial */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="asset-category"
              label="Category"
              required
              error={errors.category?.message}
            >
              <select
                id="asset-category"
                {...register("category")}
                className={errors.category ? inputErrorClass : inputClass}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              id="asset-serial"
              label="Serial Number"
              error={errors.serialNumber?.message}
              hint="Optional — leave blank if not applicable"
            >
              <input
                id="asset-serial"
                {...register("serialNumber")}
                placeholder="e.g. C02X1234HV2N"
                className={inputClass}
              />
            </FormField>
          </div>

          {/* Location & Purchase Date */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="asset-location"
              label="Location"
              required
              error={errors.location?.message}
            >
              <select
                id="asset-location"
                {...register("location")}
                className={errors.location ? inputErrorClass : inputClass}
              >
                <option value="">Select location</option>
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              id="asset-purchase-date"
              label="Purchase Date"
              error={errors.purchaseDate?.message}
            >
              <input
                id="asset-purchase-date"
                type="date"
                {...register("purchaseDate")}
                className={inputClass}
              />
            </FormField>
          </div>

          {/* Description */}
          <FormField
            id="asset-description"
            label="Description"
            error={errors.description?.message}
            hint="Optional — any notes about this asset"
          >
            <textarea
              id="asset-description"
              {...register("description")}
              placeholder="Describe the asset condition, purpose, or any notes..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </FormField>

          {/* Info Note */}
          <div className="flex items-start gap-2.5 bg-surface-container/50 border border-outline-variant/40 rounded-lg px-4 py-3">
            <span className="material-symbols-outlined text-sm text-on-surface-variant shrink-0 mt-0.5">
              info
            </span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              A unique Asset Tag (e.g. <span className="font-mono text-primary">AF-XXXX</span>) will be
              automatically generated upon registration. Status defaults to{" "}
              <strong>Available</strong>.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Link
              href="/assets"
              className="flex-1 bg-surface-container border border-outline-variant text-on-surface font-semibold py-3 rounded-lg text-sm hover:bg-surface-container-high transition-all text-center"
            >
              Cancel
            </Link>
            <button
              id="new-asset-submit"
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary text-on-primary font-bold py-3 rounded-lg text-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">
                    add
                  </span>
                  Register Asset
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
