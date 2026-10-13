"use client";

import { useActionState } from "react";
import {
  signIn,
  signInManager,
  signUp,
  signUpManager,
  type AuthActionState,
} from "@/app/auth/actions";

type AuthFormProps = {
  mode: "sign-in" | "sign-up" | "manager-sign-in" | "manager-sign-up";
};

const initialState: AuthActionState = {};

export function AuthForm({ mode }: AuthFormProps) {
  const actionHandler =
    mode === "manager-sign-in"
      ? signInManager
      : mode === "manager-sign-up"
        ? signUpManager
        : mode === "sign-in"
          ? signIn
          : signUp;
  const [state, formAction, pending] = useActionState(
    actionHandler,
    initialState,
  );

  return (
    <form action={formAction} className="mt-7 space-y-5">
      <div>
        <label
          className="mb-2 block text-sm font-medium text-slate-700"
          htmlFor="email"
        >
          Email
        </label>
        <input
          autoComplete="email"
          className="w-full rounded-lg border border-slate-300 bg-white/55 px-3 py-2.5 text-sm outline-none transition focus:border-[#659287] focus:ring-2 focus:ring-[#B1D3B9]/60"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>
      <div>
        <label
          className="mb-2 block text-sm font-medium text-slate-700"
          htmlFor="password"
        >
          Password
        </label>
        <input
          autoComplete={mode.endsWith("sign-up") ? "new-password" : "current-password"}
          className="w-full rounded-lg border border-slate-300 bg-white/55 px-3 py-2.5 text-sm outline-none transition focus:border-[#659287] focus:ring-2 focus:ring-[#B1D3B9]/60"
          id="password"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </div>
      {state.error && (
        <p aria-live="polite" className="text-sm text-rose-700" role="alert">
          {state.error}
        </p>
      )}
      {state.message && (
        <p aria-live="polite" className="text-sm text-emerald-700" role="status">
          {state.message}
        </p>
      )}
      <button
        className="palette-button w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending
          ? "Please wait..."
          : mode === "sign-up"
            ? "Create user account"
            : mode === "manager-sign-in"
              ? "Sign in to manager portal"
              : mode === "manager-sign-up"
                ? "Create manager account"
                : "Sign in"}
      </button>
    </form>
  );
}
