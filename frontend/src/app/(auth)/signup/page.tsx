"use client";

/**
 * @module SignupPage
 * @description Signup / account registration page for AssetFlow.
 *              IMPORTANT: Admin role is NEVER selectable. Default role is always EMPLOYEE.
 *              Uses react-hook-form + Zod v4 for validation.
 *              Integrates with POST /api/auth/signup → { user }
 * @authors Developer 3
 * @status In-Progress (mock API, awaiting Backend Developer A)
 * @collaboration Backend Developer A: POST /api/auth/signup
 */

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50),
    employeeId: z
      .string()
      .min(3, "Employee ID is required")
      .max(20, "Employee ID is too long")
      .regex(/^[A-Za-z0-9\-]+$/, "Only letters, numbers, and hyphens allowed"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

function InputField({
  id,
  label,
  type = "text",
  placeholder,
  registration,
  error,
  hint,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registration: any;
  error?: string;
  hint?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        {...registration}
        className={`w-full bg-surface-container-low border rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all focus:ring-2 focus:ring-primary/50 focus:border-primary ${
          error
            ? "border-error ring-1 ring-error/30"
            : "border-outline-variant"
        }`}
      />
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

export default function SignupPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setServerError(null);
    try {
      // Role is always EMPLOYEE — never sent from user input
      const payload = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        employeeId: data.employeeId,
        role: "EMPLOYEE" as const,
      };

      // TODO: replace with real API call once Backend Developer A is ready
      // const res = await fetch('/api/auth/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });
      // if (!res.ok) throw new Error((await res.json()).message);

      console.log("Signup payload:", payload); // for dev verification
      await new Promise((r) => setTimeout(r, 1200));
      setIsSuccess(true);
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md glass-card rounded-2xl p-8 shadow-2xl text-center space-y-4">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
          <span
            className="material-symbols-outlined text-primary text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            mark_email_read
          </span>
        </div>
        <h2 className="font-hanken font-bold text-xl text-on-surface">
          Account Request Submitted
        </h2>
        <p className="text-on-surface-variant text-sm max-w-xs mx-auto">
          Your request has been sent to the admin team for approval. You will
          receive an email when your account is activated.
        </p>
        <Link
          href="/login"
          className="block w-full bg-surface-container border border-outline-variant text-on-surface font-bold py-3 rounded-lg text-sm hover:bg-surface-container-high transition-all"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md glass-card rounded-2xl p-8 shadow-2xl">
      {/* Heading */}
      <div className="mb-6">
        <h1 className="font-hanken font-bold text-2xl text-on-surface">
          Request Access
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Create your AssetFlow employee account
        </p>
      </div>

      {/* Role badge — always Employee, not selectable */}
      <div className="mb-5 flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2.5">
        <span
          className="material-symbols-outlined text-primary text-base"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          badge
        </span>
        <span className="text-xs text-primary font-semibold">
          Role:{" "}
          <span className="uppercase tracking-wider font-mono">Employee</span>
        </span>
        <span className="ml-auto text-[10px] text-on-surface-variant/60 font-mono">
          Default
        </span>
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
        {/* Name Row */}
        <div className="grid grid-cols-2 gap-3">
          <InputField
            id="signup-firstname"
            label="First Name"
            placeholder="Priya"
            registration={register("firstName")}
            error={errors.firstName?.message}
            autoComplete="given-name"
          />
          <InputField
            id="signup-lastname"
            label="Last Name"
            placeholder="Shah"
            registration={register("lastName")}
            error={errors.lastName?.message}
            autoComplete="family-name"
          />
        </div>

        {/* Employee ID */}
        <InputField
          id="signup-employeeid"
          label="Employee ID"
          placeholder="EMP-0042"
          registration={register("employeeId")}
          error={errors.employeeId?.message}
          hint="Provided by your HR department"
        />

        {/* Email */}
        <InputField
          id="signup-email"
          label="Work Email"
          type="email"
          placeholder="you@company.com"
          registration={register("email")}
          error={errors.email?.message}
          autoComplete="email"
        />

        {/* Password */}
        <InputField
          id="signup-password"
          label="Password"
          type="password"
          placeholder="••••••••"
          registration={register("password")}
          error={errors.password?.message}
          hint="Min 8 characters, one uppercase, one number"
          autoComplete="new-password"
        />

        {/* Confirm Password */}
        <InputField
          id="signup-confirmpassword"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          registration={register("confirmPassword")}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
        />

        {/* Submit */}
        <button
          id="signup-submit"
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg text-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
              Submitting Request...
            </>
          ) : (
            <>
              Submit Access Request
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-xs text-on-surface-variant">
        Already have an account?{" "}
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
