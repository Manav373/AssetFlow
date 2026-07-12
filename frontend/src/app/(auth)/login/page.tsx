"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS = [
  {
    role: "Admin",
    email: "admin@assetflow.com",
    password: "AdminPassword123!",
    icon: "admin_panel_settings",
    color: "primary",
    desc: "Full platform access",
  },
  {
    role: "Manager",
    email: "rahul.mehta@company.com",
    password: "EmployeePassword123!",
    icon: "manage_accounts",
    color: "secondary",
    desc: "Dept head approvals",
  },
  {
    role: "Employee",
    email: "priya.shah@company.com",
    password: "EmployeePassword123!",
    icon: "person",
    color: "tertiary",
    desc: "Self-service portal",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@assetflow.com",
      password: "AdminPassword123!",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });

      localStorage.setItem("token", res.accessToken);
      localStorage.setItem("user", JSON.stringify(res.user));

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md glass-card rounded-2xl p-10 shadow-2xl text-center space-y-5 bg-surface border border-outline-variant/20">
        <div className="w-16 h-16 bg-secondary/15 rounded-2xl flex items-center justify-center mx-auto">
          <span
            className="material-symbols-outlined text-secondary text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>
        <h2 className="font-hanken font-bold text-2xl text-on-surface">
          Welcome back!
        </h2>
        <p className="text-on-surface-variant text-sm">
          Authentication successful. Redirecting to your dashboard...
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="glass-card rounded-2xl p-8 shadow-2xl bg-surface border border-outline-variant/20">
        {/* Heading */}
        <div className="mb-7">
          <h1 className="font-hanken font-bold text-2xl text-on-surface">
            Welcome back
          </h1>
          <p className="text-on-surface-variant text-sm mt-1.5">
            Sign in to access your AssetFlow workspace
          </p>
        </div>

        {/* Server Error */}
        {serverError && (
          <div className="mb-5 flex items-center gap-2.5 bg-error/8 border border-error/25 rounded-xl px-4 py-3 text-error text-sm">
            <span className="material-symbols-outlined text-base shrink-0">
              error
            </span>
            <span className="text-xs font-medium">{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="login-email"
              className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider"
            >
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/40 text-lg">
                mail
              </span>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                {...register("email")}
                placeholder="you@company.com"
                className={`w-full bg-surface-container-low border rounded-xl pl-11 pr-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/30 outline-none transition-all focus:ring-2 focus:ring-primary/40 focus:border-primary ${
                  errors.email
                    ? "border-error ring-1 ring-error/30"
                    : "border-outline-variant/50"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-error text-[11px] flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">error_outline</span>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/40 text-lg">
                lock
              </span>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                {...register("password")}
                placeholder="••••••••"
                className={`w-full bg-surface-container-low border rounded-xl pl-11 pr-12 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/30 outline-none transition-all focus:ring-2 focus:ring-primary/40 focus:border-primary ${
                  errors.password
                    ? "border-error ring-1 ring-error/30"
                    : "border-outline-variant/50"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-on-surface-variant transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {errors.password && (
              <p className="text-error text-[11px] flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">error_outline</span>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-on-primary font-bold py-3.5 rounded-xl text-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                Sign in
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-on-surface-variant">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary font-semibold hover:underline"
          >
            Request access
          </Link>
        </p>
      </div>

      {/* Demo Credential Cards */}
      <div className="mt-5 space-y-2.5">
        <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-[0.15em] text-center">
          Quick Demo Access
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.role}
              type="button"
              onClick={() => {
                setValue("email", account.email);
                setValue("password", account.password);
              }}
              className={`bg-surface border border-outline-variant/25 hover:border-${account.color}/40 rounded-xl p-3 text-center transition-all group cursor-pointer hover:shadow-md`}
            >
              <div className={`w-8 h-8 bg-${account.color}/10 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-${account.color}/15 transition-colors`}>
                <span className={`material-symbols-outlined text-${account.color} text-base`}>
                  {account.icon}
                </span>
              </div>
              <p className={`text-[11px] font-bold text-${account.color}`}>{account.role}</p>
              <p className="text-[9px] text-on-surface-variant mt-0.5">{account.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
