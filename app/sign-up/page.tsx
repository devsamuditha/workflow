import Link from "next/link";
import { Workflow } from "lucide-react";
import { AuthForm } from "@/features/auth/components/auth-form";

export default function SignUpPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link className="mb-8 flex items-center gap-3" href="/">
          <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Workflow aria-hidden="true" size={22} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-950">
            WorkFlow
          </span>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          Create your workspace
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Sign up to add and manage your own projects.
        </p>
        <AuthForm mode="sign-up" />
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            className="font-medium text-indigo-700 hover:text-indigo-800"
            href="/sign-in"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
