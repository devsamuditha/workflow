import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AuthSessionMissingError } from "@supabase/supabase-js";
import { WorkspaceDashboard } from "@/features/projects/components/workspace-dashboard";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { withUserDatabase } from "@/lib/db/with-user-database";
import { isManagerEmail } from "@/lib/auth/manager-access";

async function AuthenticatedWorkspace() {
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

  const { projects, reminders } = await withUserDatabase(
    user.id,
    async (transaction) => {
      const [projects, reminders] = await Promise.all([
        transaction.project.findMany({
          where: { ownerId: user.id },
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            priority: true,
            startDate: true,
            dueDate: true,
            progress: true,
          },
        }),
        transaction.reminder.findMany({
          where: { ownerId: user.id },
          orderBy: [{ date: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            title: true,
            description: true,
            date: true,
          },
        }),
      ]);

      return { projects, reminders };
    },
  );

  return (
    <WorkspaceDashboard
      email={user.email ?? ""}
      isManager={isManagerEmail(user.email)}
      today={new Date().toISOString().slice(0, 10)}
      reminders={reminders.map((reminder) => ({
        ...reminder,
        date: reminder.date.toISOString().slice(0, 10),
      }))}
      projects={projects.map((project) => ({
        ...project,
        startDate: project.startDate?.toISOString() ?? null,
        dueDate: project.dueDate?.toISOString() ?? null,
      }))}
    />
  );
}

function WorkspaceLoading() {
  return (
    <main className="grid min-h-screen place-items-center text-sm text-slate-500">
      Loading your workspace...
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<WorkspaceLoading />}>
      <AuthenticatedWorkspace />
    </Suspense>
  );
}
