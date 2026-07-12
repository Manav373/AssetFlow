"use client";

/**
 * @module ForgotPasswordPage
 * @description Password recovery page for AssetFlow.
 *              Sends recovery email via POST /api/auth/forgot-password.
 * @authors Developer 3
 * @status In-Progress (mock, awaiting Backend Developer A)
 */

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    setServerError(null);
    try {
      // TODO: replace with real API call
      // await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: data.email }),
      // });
      await new Promise((r) => setTimeout(r, 900));
      setSubmittedEmail(data.email);
      setIsSuccess(true);
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-sm glass-card rounded-2xl p-8 shadow-2xl text-center space-y-5">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
          <span
            className="material-symbols-outlined text-primary text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            mark_email_read
          </span>
        </div>
        <div>
          <h2 className="font-hanken font-bold text-xl text-on-surface">
            Check your inbox
          </h2>
          <p className="text-on-surface-variant text-sm mt-2 leading-relaxed">
            If an account exists for{" "}
            <span className="text-on-surface font-semibold">
              {submittedEmail}
            </span>
            , you will receive a password reset link shortly.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            href="/login"
            className="block w-full bg-primary text-on-primary font-bold py-3 rounded-lg text-sm hover:brightness-110 transition-all"
          >
            Back to Login
          </Link>
          <button
            onClick={() => {
              setIsSuccess(false);
              setSubmittedEmail("");
            }}
            className="w-full text-on-surface-variant text-xs hover:text-on-surface transition-colors py-2"
          >
            Try a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm glass-card rounded-2xl p-8 shadow-2xl">
      {/* Heading */}
      <div className="mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
          <span
            className="material-symbols-outlined text-primary text-2xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            lock_reset
          </span>
        </div>
        <h1 className="font-hanken font-bold text-2xl text-on-surface">
          Forgot password?
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Enter your email and we&apos;ll send you a recovery link.
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
        <div className="space-y-1.5">
          <label
            htmlFor="forgot-email"
            className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider"
          >
            Email Address
          </label>
          <input
            id="forgot-email"
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
            <p className="text-error text-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">
                error_outline
              </span>
              {errors.email.message}
            </p>
          )}
        </div>

        <button
          id="forgot-submit"
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg text-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              Send Recovery Link
              <span className="material-symbols-outlined text-sm">send</span>
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-xs text-on-surface-variant">
        Remembered it?{" "}
        <Link
          href="/login"
          className="text-primary font-semibold hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
