import Link from "next/link";
import { ShieldCheck, Workflow } from "lucide-react";
import { AuthForm } from "@/features/auth/components/auth-form";

export default function SignInPage() {
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
        <p className="inline-flex rounded-full border border-[#B1D3B9]/80 bg-white/55 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#486F66] shadow-sm backdrop-blur">
          YOUR WORKSPACE
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
          Welcome back
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Sign in to see and manage your projects.
        </p>
        <AuthForm mode="sign-in" />
        <p className="mt-7 text-center text-sm text-slate-600">
          New to WorkFlow?{" "}
          <Link
            className="font-semibold text-[#486F66] transition hover:text-[#659287]"
            href="/sign-up"
          >
            Create an account
          </Link>
        </p>
        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-[#659287]/15" />
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
            or
          </span>
          <span className="h-px flex-1 bg-[#659287]/15" />
        </div>
        <Link
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#659287]/20 bg-white/45 px-4 py-3 text-sm font-semibold text-[#486F66] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-[#E6F2DD]/70 hover:shadow-md"
          href="/manager/sign-in"
        >
          <ShieldCheck aria-hidden="true" size={17} />
          Manager sign in
        </Link>
      </section>
    </main>
  );
}
