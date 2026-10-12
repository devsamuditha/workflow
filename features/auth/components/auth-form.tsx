"use client";

import { useActionState } from "react";
import { signIn, signUp, type AuthActionState } from "@/app/auth/actions";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
};

const initialState: AuthActionState = {};

export function AuthForm({ mode }: AuthFormProps) {
  const actionHandler = mode === "sign-in" ? signIn : signUp;
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
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending
          ? "Please wait..."
          : mode === "sign-in"
            ? "Sign in"
            : "Create account"}
      </button>
    </form>
  );
}
