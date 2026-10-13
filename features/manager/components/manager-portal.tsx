import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  FolderKanban,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import type { ProjectPriority, ProjectStatus } from "@prisma/client";
import { signOut } from "@/app/auth/actions";

type ManagerProject = {
  id: string;
  ownerId: string;
  ownerEmail: string | null;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string | null;
  dueDate: string | null;
  progress: number;
  createdAt: string;
  updatedAt: string;
};

type ManagerReminder = {
  id: string;
  ownerId: string;
  ownerEmail: string | null;
  title: string;
  description: string | null;
  date: string;
  createdAt: string;
};

type ManagerPortalProps = {
  email: string;
  projects: ManagerProject[];
  reminders: ManagerReminder[];
};

const statusLabels: Record<ProjectStatus, string> = {
  TARGET: "Target",
  PENDING: "Pending",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
};

const statusStyles: Record<ProjectStatus, string> = {
  TARGET: "bg-[#E6F2DD]/85 text-[#486F66]",
  PENDING: "bg-[#B1D3B9]/45 text-[#486F66]",
  ONGOING: "bg-[#88BDA4]/35 text-[#3F756A]",
  COMPLETED: "bg-[#659287]/15 text-[#486F66]",
};

const priorityLabels: Record<ProjectPriority, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
};

const priorityStyles: Record<ProjectPriority, string> = {
  LOW: "bg-slate-100/80 text-slate-600",
  NORMAL: "bg-[#E6F2DD] text-[#486F66]",
  HIGH: "bg-[#B1D3B9]/60 text-[#486F66]",
  URGENT: "bg-rose-100 text-rose-700",
};

function formatDate(value: string | null, includeTime = false) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(includeTime ? { hour: "numeric", minute: "2-digit" } : {}),
    timeZone: "UTC",
  }).format(new Date(value));
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FolderKanban;
  label: string;
  value: number;
}) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
        <span className="flex size-11 items-center justify-center rounded-xl bg-[#B1D3B9]/55 text-[#486F66]">
          <Icon aria-hidden="true" size={20} />
        </span>
      </div>
    </div>
  );
}

function OwnerCell({ email }: { email: string | null }) {
  return (
    <span className="font-medium text-slate-700">
      {email ?? "Email unavailable"}
    </span>
  );
}

export function ManagerPortal({
  email,
  projects,
  reminders,
}: ManagerPortalProps) {
  const activeProjects = projects.filter(
    (project) => project.status === "ONGOING",
  ).length;
  const owners = new Set([
    ...projects.map((project) => project.ownerId),
    ...reminders.map((reminder) => reminder.ownerId),
  ]);

  return (
    <div className="min-h-screen text-slate-900">
      <header className="sticky top-0 z-20 border-b border-white/65 bg-white/55 backdrop-blur-2xl">
        <div className="mx-auto flex min-h-16 max-w-[1600px] items-center justify-between gap-4 px-5 sm:px-8">
          <Link
            className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-slate-600 transition hover:bg-white/65 hover:text-[#486F66]"
            href="/"
          >
            <ArrowLeft aria-hidden="true" size={17} />
            My workspace
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-64 truncate rounded-full border border-white/70 bg-white/45 px-3 py-1.5 text-xs text-slate-600 sm:block">
              {email}
            </span>
            <form action={signOut}>
              <button
                className="rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-white/70 hover:bg-white/70"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#B1D3B9]/80 bg-white/55 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#486F66] shadow-sm backdrop-blur">
              <ShieldCheck aria-hidden="true" size={14} />
              MANAGER PORTAL
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Workspace overview
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Read-only view of every user&apos;s projects and scheduled
              reminders.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={FolderKanban}
            label="All projects"
            value={projects.length}
          />
          <SummaryCard
            icon={Clock3}
            label="In progress"
            value={activeProjects}
          />
          <SummaryCard
            icon={UsersRound}
            label="Project owners"
            value={owners.size}
          />
          <SummaryCard
            icon={CalendarDays}
            label="Reminders"
            value={reminders.length}
          />
        </div>

        <section className="mt-9" aria-labelledby="all-projects-heading">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2
                className="text-xl font-semibold tracking-tight text-slate-950"
                id="all-projects-heading"
              >
                All projects
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Project details, owner, schedule, status, and progress.
              </p>
            </div>
            <span className="rounded-full border border-white/80 bg-white/55 px-3 py-1 text-xs font-semibold text-[#486F66]">
              {projects.length} total
            </span>
          </div>
          <div className="glass-panel overflow-hidden rounded-2xl">
            {projects.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1320px] border-collapse text-left text-sm">
                  <thead className="bg-[#E6F2DD]/55 text-xs uppercase tracking-wide text-[#486F66]">
                    <tr>
                      <th className="px-4 py-3 font-semibold" scope="col">Project</th>
                      <th className="px-4 py-3 font-semibold" scope="col">Owner</th>
                      <th className="px-4 py-3 font-semibold" scope="col">Status</th>
                      <th className="px-4 py-3 font-semibold" scope="col">Priority</th>
                      <th className="px-4 py-3 font-semibold" scope="col">Start</th>
                      <th className="px-4 py-3 font-semibold" scope="col">Deadline</th>
                      <th className="px-4 py-3 font-semibold" scope="col">Progress</th>
                      <th className="px-4 py-3 font-semibold" scope="col">Created</th>
                      <th className="px-4 py-3 font-semibold" scope="col">Updated</th>
                      <th className="px-4 py-3 font-semibold" scope="col">Project ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/70">
                    {projects.map((project) => (
                      <tr className="align-top transition hover:bg-white/35" key={project.id}>
                        <td className="max-w-64 px-4 py-4">
                          <p className="font-semibold text-slate-900">
                            {project.name}
                          </p>
                          <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-slate-600">
                            {project.description || "No description"}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <OwnerCell email={project.ownerEmail} />
                        </td>
                        <td className="px-4 py-4">
                          <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[project.status]}`}>
                            {statusLabels[project.status]}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${priorityStyles[project.priority]}`}>
                            {priorityLabels[project.priority]}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                          {formatDate(project.startDate)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                          {formatDate(project.dueDate)}
                        </td>
                        <td className="min-w-36 px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div
                              aria-label={`Project progress: ${project.progress}%`}
                              aria-valuemax={100}
                              aria-valuemin={0}
                              aria-valuenow={project.progress}
                              className="h-2 min-w-16 flex-1 overflow-hidden rounded-full bg-[#B1D3B9]/45"
                              role="progressbar"
                            >
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#659287] to-[#88BDA4]"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <span className="w-9 text-right text-xs font-medium text-slate-600">
                              {project.progress}%
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                          {formatDate(project.createdAt, true)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                          {formatDate(project.updatedAt, true)}
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-slate-500">
                          {project.id}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState message="Projects will appear here when users create them." />
            )}
          </div>
        </section>

        <section className="mt-9" aria-labelledby="all-reminders-heading">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2
                className="text-xl font-semibold tracking-tight text-slate-950"
                id="all-reminders-heading"
              >
                All reminders
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Scheduled dates, reminder notes, and their owners.
              </p>
            </div>
            <span className="rounded-full border border-white/80 bg-white/55 px-3 py-1 text-xs font-semibold text-[#486F66]">
              {reminders.length} total
            </span>
          </div>
          <div className="glass-panel overflow-hidden rounded-2xl">
            {reminders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                  <thead className="bg-[#E6F2DD]/55 text-xs uppercase tracking-wide text-[#486F66]">
                    <tr>
                      <th className="px-4 py-3 font-semibold" scope="col">Reminder</th>
                      <th className="px-4 py-3 font-semibold" scope="col">Owner</th>
                      <th className="px-4 py-3 font-semibold" scope="col">Scheduled date</th>
                      <th className="px-4 py-3 font-semibold" scope="col">Created</th>
                      <th className="px-4 py-3 font-semibold" scope="col">Reminder ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/70">
                    {reminders.map((reminder) => (
                      <tr className="align-top transition hover:bg-white/35" key={reminder.id}>
                        <td className="max-w-96 px-4 py-4">
                          <p className="font-semibold text-slate-900">
                            {reminder.title}
                          </p>
                          <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-slate-600">
                            {reminder.description || "No notes"}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <OwnerCell email={reminder.ownerEmail} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                          {formatDate(reminder.date)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                          {formatDate(reminder.createdAt, true)}
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-slate-500">
                          {reminder.id}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState message="Scheduled reminders will appear here." />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="px-6 py-12 text-center text-sm text-slate-600">{message}</p>
  );
}
