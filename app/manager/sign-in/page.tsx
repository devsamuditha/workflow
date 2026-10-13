import Link from "next/link";
import { ArrowLeft, ShieldCheck, UserPlus, Workflow } from "lucide-react";
import { AuthForm } from "@/features/auth/components/auth-form";

export default function ManagerSignInPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12 sm:px-8">
      <section className="glass-panel w-full max-w-md rounded-3xl bg-white/65 p-7 shadow-2xl sm:p-9">
        <Link className="mb-9 flex items-center gap-3" href="/">
          <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#659287] to-[#88BDA4] text-white shadow-lg shadow-[#659287]/25">
            <Workflow aria-hidden="true" size={22} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-950">
            WorkFlow
          </span>
        </Link>

        <p className="inline-flex items-center gap-2 rounded-full border border-[#B1D3B9]/80 bg-white/55 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#486F66] shadow-sm backdrop-blur">
          <ShieldCheck aria-hidden="true" size={14} />
          MANAGER ACCESS
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
          Manager sign in
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Sign in with the manager account to view projects and reminders
          across all workspaces.
        </p>

        <AuthForm mode="manager-sign-in" />

        <p className="mt-6 text-center text-sm text-slate-600">
          Need to create the configured manager account?{" "}
          <Link
            className="inline-flex items-center gap-1 font-semibold text-[#486F66] transition hover:text-[#659287]"
            href="/manager/sign-up"
          >
            <UserPlus aria-hidden="true" size={15} />
            Manager sign up
          </Link>
        </p>

        <Link
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#486F66] transition hover:text-[#659287]"
          href="/sign-in"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Back to regular sign in
        </Link>
      </section>
    </main>
  );
}
