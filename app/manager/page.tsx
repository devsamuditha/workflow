import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AuthSessionMissingError } from "@supabase/supabase-js";
import { ManagerPortal } from "@/features/manager/components/manager-portal";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isManagerEmail } from "@/lib/auth/manager-access";
import { withManagerDatabase } from "@/lib/db/with-manager-database";

async function AuthenticatedManagerPortal() {
  await connection();
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error && !(error instanceof AuthSessionMissingError)) {
    throw new Error(`Unable to verify the current user: ${error.message}`);
  }

  if (!user) {
    redirect("/sign-in");
  }

  if (!isManagerEmail(user.email)) {
    redirect("/");
  }

  const { projects, reminders, owners } = await withManagerDatabase(
    user.id,
    user.email,
    async (transaction) => {
      const [projects, reminders, owners] = await Promise.all([
        transaction.project.findMany({
          orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
          select: {
            id: true,
            ownerId: true,
            name: true,
            description: true,
            status: true,
            priority: true,
            startDate: true,
            dueDate: true,
            progress: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        transaction.reminder.findMany({
          orderBy: [{ date: "asc" }, { createdAt: "desc" }],
          select: {
            id: true,
            ownerId: true,
            title: true,
            description: true,
            date: true,
            createdAt: true,
          },
        }),
        transaction.$queryRaw<{ ownerId: string; email: string | null }[]>`
          SELECT owner_id AS "ownerId", email
          FROM public.manager_owner_emails()
        `,
      ]);

      return { projects, reminders, owners };
    },
  );

  const ownerEmails = new Map(
    owners.map(({ ownerId, email }) => [ownerId, email]),
  );

  return (
    <ManagerPortal
      email={user.email ?? ""}
      projects={projects.map((project) => ({
        ...project,
        ownerEmail: ownerEmails.get(project.ownerId) ?? null,
        startDate: project.startDate?.toISOString().slice(0, 10) ?? null,
        dueDate: project.dueDate?.toISOString().slice(0, 10) ?? null,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      }))}
      reminders={reminders.map((reminder) => ({
        ...reminder,
        ownerEmail: ownerEmails.get(reminder.ownerId) ?? null,
        date: reminder.date.toISOString().slice(0, 10),
        createdAt: reminder.createdAt.toISOString(),
      }))}
    />
  );
}

function ManagerLoading() {
  return (
    <main className="grid min-h-screen place-items-center text-sm text-slate-600">
      Loading the manager portal...
    </main>
  );
}

export default function ManagerPage() {
  return (
    <Suspense fallback={<ManagerLoading />}>
      <AuthenticatedManagerPortal />
    </Suspense>
  );
}
