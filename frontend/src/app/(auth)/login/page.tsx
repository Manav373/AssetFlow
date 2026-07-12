"use client";

/**
 * @module LoginPage
 * @description Login page for AssetFlow.
 *              Uses react-hook-form + Zod v4 for validation.
 *              Integrates with POST /api/auth/login → { accessToken, refreshToken, user }
 * @authors Developer 3
 * @status In-Progress (mock API, awaiting Backend Developer A)
 * @collaboration Backend Developer A: POST /api/auth/login
 */

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      // TODO: replace with real API call once Backend Developer A is ready
      // const res = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      // if (!res.ok) throw new Error((await res.json()).message);
      // const { accessToken, refreshToken, user } = await res.json();
      // Store tokens and redirect to /dashboard

      // Mock: simulate API delay
      await new Promise((r) => setTimeout(r, 1000));
      if (data.email === "wrong@example.com") {
        throw new Error("Invalid email or password.");
      }
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-sm glass-card rounded-2xl p-8 shadow-2xl text-center space-y-4">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
          <span
            className="material-symbols-outlined text-primary text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>
        <h2 className="font-hanken font-bold text-xl text-on-surface">
          Welcome back!
        </h2>
        <p className="text-on-surface-variant text-sm">
          Login successful. Redirecting to your dashboard...
        </p>
        <Link
          href="/dashboard"
          className="block w-full bg-primary text-on-primary font-bold py-3 rounded-lg text-sm hover:brightness-110 transition-all"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm glass-card rounded-2xl p-8 shadow-2xl">
      {/* Heading */}
      <div className="mb-6">
        <h1 className="font-hanken font-bold text-2xl text-on-surface">
          Sign in
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Access your AssetFlow workspace
        </p>
      </div>

      {/* Server Error */}
      {serverError && (
        <div className="mb-4 flex items-center gap-2.5 bg-error-container/20 border border-error/30 rounded-lg px-4 py-3 text-error text-sm">
          <span className="material-symbols-outlined text-base shrink-0">
            error
          </span>
          {serverError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="login-email"
            className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider"
          >
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            {...register("email")}
            placeholder="you@company.com"
            className={`w-full bg-surface-container-low border rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all focus:ring-2 focus:ring-primary/50 focus:border-primary ${
              errors.email
                ? "border-error ring-1 ring-error/30"
                : "border-outline-variant"
            }`}
          />
          {errors.email && (
            <p className="text-error text-xs flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-xs">
                error_outline
              </span>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            placeholder="••••••••"
            className={`w-full bg-surface-container-low border rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all focus:ring-2 focus:ring-primary/50 focus:border-primary ${
              errors.password
                ? "border-error ring-1 ring-error/30"
                : "border-outline-variant"
            }`}
          />
          {errors.password && (
            <p className="text-error text-xs flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-xs">
                error_outline
              </span>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          id="login-submit"
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg text-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
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
  );
}
