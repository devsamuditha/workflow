import Link from "next/link";
import { ArrowLeft, ShieldCheck, Workflow } from "lucide-react";
import { AuthForm } from "@/features/auth/components/auth-form";

export default function ManagerSignUpPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-5 py-12 sm:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-1/4 size-72 rounded-full bg-[#88BDA4]/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 bottom-10 size-80 rounded-full bg-[#B1D3B9]/35 blur-3xl"
      />
      <section className="glass-panel relative w-full max-w-md rounded-3xl bg-white/65 p-7 shadow-2xl sm:p-9">
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
          CONFIGURED MANAGER ACCOUNT
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
          Manager sign up
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Create the manager account for the email configured by the
          application owner.
        </p>

        <AuthForm mode="manager-sign-up" />

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have the manager account?{" "}
          <Link
            className="font-semibold text-[#486F66] transition hover:text-[#659287]"
            href="/manager/sign-in"
          >
            Manager sign in
          </Link>
        </p>
        <Link
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#486F66] transition hover:text-[#659287]"
          href="/sign-up"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Back to user sign up
        </Link>
      </section>
    </main>
  );
}
