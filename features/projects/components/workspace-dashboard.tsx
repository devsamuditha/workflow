"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Activity,
  BadgeCheck,
  CalendarDays,
  Check,
  CircleDot,
  Clock3,
  FolderKanban,
  Layers3,
  LogOut,
  Plus,
  ShieldCheck,
  Target,
  Workflow,
  X,
} from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { createProject, type ProjectActionState } from "@/app/projects/actions";
import {
  ScheduleCalendar,
  type ReminderData,
} from "@/features/projects/components/schedule-calendar";
import type { ProjectPriority, ProjectStatus } from "@prisma/client";

export type ProjectCardData = {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string | null;
  dueDate: string | null;
  progress: number;
};

type WorkspaceDashboardProps = {
  email: string;
  isManager: boolean;
  projects: ProjectCardData[];
  reminders: ReminderData[];
  today: string;
};

const sections: {
  status: ProjectStatus;
  label: string;
  icon: typeof CircleDot;
  color: string;
  emptyMessage: string;
}[] = [
  {
    status: "ONGOING",
    label: "Ongoing",
    icon: CircleDot,
    color: "text-[#659287]",
    emptyMessage: "Projects you're working on will appear here.",
  },
  {
    status: "PENDING",
    label: "Pending",
    icon: Clock3,
    color: "text-amber-600",
    emptyMessage: "Projects waiting to start will appear here.",
  },
  {
    status: "COMPLETED",
    label: "Completed",
    icon: Check,
    color: "text-[#659287]",
    emptyMessage: "Finished projects will appear here.",
  },
  {
    status: "TARGET",
    label: "Target",
    icon: Target,
    color: "text-[#659287]",
    emptyMessage: "Future project targets will appear here.",
  },
];

const priorityLabels: Record<ProjectPriority, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
};

const priorityStyles: Record<ProjectPriority, string> = {
  LOW: "bg-slate-100 text-slate-600",
  NORMAL: "bg-blue-50 text-blue-700",
  HIGH: "bg-amber-50 text-amber-700",
  URGENT: "bg-rose-50 text-rose-700",
};

function formatDate(value: string | null) {
  if (!value) return "No deadline";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function ProjectCard({ project }: { project: ProjectCardData }) {
  return (
    <article className="glass-panel group rounded-xl p-4 transition duration-200 hover:-translate-y-0.5 hover:bg-white/80">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 break-words font-semibold text-slate-900">
          {project.name}
        </h3>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${priorityStyles[project.priority]}`}
        >
          {priorityLabels[project.priority]}
        </span>
      </div>
      {project.description && (
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600">
          {project.description}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays aria-hidden="true" size={14} />
          {formatDate(project.dueDate)}
        </span>
        {project.startDate && (
          <span>Starts {formatDate(project.startDate)}</span>
        )}
      </div>
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-slate-500">Progress</span>
          <span className="font-medium text-slate-700">
            {project.progress}%
          </span>
        </div>
        <div
          aria-label={`Project progress: ${project.progress}%`}
          className="h-1.5 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={project.progress}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#659287] to-[#88BDA4] transition-all"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>
    </article>
  );
}

const initialProjectState: ProjectActionState = {};

function AddProjectDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    createProject,
    initialProjectState,
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (state.success) onCreated();
  }, [onCreated, state.success]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="add-project-title"
        aria-modal="true"
        className="glass-panel my-auto w-full max-w-xl rounded-2xl bg-white/85 p-6 shadow-2xl sm:p-8"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              className="text-xl font-semibold tracking-tight text-slate-950"
              id="add-project-title"
            >
              Add a project
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Set up the basics. You can organize tasks in a later step.
            </p>
          </div>
          <button
            aria-label="Close add project dialog"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <form action={formAction} className="mt-6 space-y-5">
          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="project-name"
            >
              Project name
            </label>
            <input
              autoFocus
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#659287] focus:ring-2 focus:ring-[#B1D3B9]/60"
              id="project-name"
              maxLength={120}
              name="name"
              placeholder="e.g. Website redesign"
              required
            />
          </div>
          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="project-description"
            >
              Description <span className="font-normal text-slate-400">Optional</span>
            </label>
            <textarea
              className="min-h-24 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#659287] focus:ring-2 focus:ring-[#B1D3B9]/60"
              id="project-description"
              maxLength={2000}
              name="description"
              placeholder="What is this project about?"
              rows={3}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                className="mb-2 block text-sm font-medium text-slate-700"
                htmlFor="project-status"
              >
                Status
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white/75 px-3 py-2.5 text-sm outline-none focus:border-[#659287] focus:ring-2 focus:ring-[#B1D3B9]/60"
                defaultValue="TARGET"
                id="project-status"
                name="status"
              >
                <option value="ONGOING">Ongoing</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="TARGET">Target</option>
              </select>
            </div>
            <div>
              <label
                className="mb-2 block text-sm font-medium text-slate-700"
                htmlFor="project-priority"
              >
                Priority
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white/75 px-3 py-2.5 text-sm outline-none focus:border-[#659287] focus:ring-2 focus:ring-[#B1D3B9]/60"
                defaultValue="NORMAL"
                id="project-priority"
                name="priority"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label
                className="mb-2 block text-sm font-medium text-slate-700"
                htmlFor="project-start-date"
              >
                Start date <span className="font-normal text-slate-400">Optional</span>
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#659287] focus:ring-2 focus:ring-[#B1D3B9]/60"
                id="project-start-date"
                name="startDate"
                type="date"
              />
            </div>
            <div>
              <label
                className="mb-2 block text-sm font-medium text-slate-700"
                htmlFor="project-due-date"
              >
                Deadline <span className="font-normal text-slate-400">Optional</span>
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#659287] focus:ring-2 focus:ring-[#B1D3B9]/60"
                id="project-due-date"
                name="dueDate"
                type="date"
              />
            </div>
          </div>
          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="project-progress"
            >
              Progress
            </label>
            <div className="flex items-center gap-3">
              <input
                className="w-24 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#659287] focus:ring-2 focus:ring-[#B1D3B9]/60"
                defaultValue={0}
                id="project-progress"
                max={100}
                min={0}
                name="progress"
                type="number"
              />
              <span className="text-sm text-slate-500">%</span>
            </div>
          </div>
          {state.error && (
            <p aria-live="polite" className="text-sm text-rose-700" role="alert">
              {state.error}
            </p>
          )}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="palette-button inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={pending}
              type="submit"
            >
              <Plus aria-hidden="true" size={16} />
              {pending ? "Saving..." : "Add project"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function WorkspaceDashboard({
  email,
  isManager,
  projects,
  reminders,
  today,
}: WorkspaceDashboardProps) {
  const [showAddProject, setShowAddProject] = useState(false);
  const [currentView, setCurrentView] = useState<"projects" | "calendar">(
    "projects",
  );
  const closeAddProject = useCallback(() => setShowAddProject(false), []);

  const completedCount = projects.filter(
    (project) => project.status === "COMPLETED",
  ).length;

  return (
    <div className="min-h-screen text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-white/60 bg-white/45 px-5 py-6 shadow-xl shadow-[#659287]/[0.08] backdrop-blur-2xl lg:flex">
        <Link className="flex items-center gap-3 px-2" href="/">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#659287] to-[#88BDA4] text-white shadow-lg shadow-[#659287]/25">
            <Workflow aria-hidden="true" size={22} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-950">
            WorkFlow
          </span>
        </Link>
        <p className="mb-3 mt-10 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Workspace
        </p>
        <nav aria-label="Workspace" className="space-y-1">
          <button
            aria-current={currentView === "projects" ? "page" : undefined}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
              currentView === "projects"
                ? "bg-[#E6F2DD]/85 text-[#486F66] shadow-sm shadow-[#659287]/10"
                : "text-slate-600 hover:bg-white/50 hover:text-slate-900"
            }`}
            onClick={() => setCurrentView("projects")}
            type="button"
          >
            <Layers3 aria-hidden="true" size={18} />
            My projects
          </button>
          <button
            aria-current={currentView === "calendar" ? "page" : undefined}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
              currentView === "calendar"
                ? "bg-[#E6F2DD]/85 text-[#486F66] shadow-sm shadow-[#659287]/10"
                : "text-slate-600 hover:bg-white/50 hover:text-slate-900"
            }`}
            onClick={() => setCurrentView("calendar")}
            type="button"
          >
            <CalendarDays aria-hidden="true" size={18} />
            Schedule calendar
          </button>
          {isManager && (
            <Link
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-white/50 hover:text-slate-900"
              href="/manager"
            >
              <ShieldCheck aria-hidden="true" size={18} />
              Manager portal
            </Link>
          )}
        </nav>
        <div className="glass-panel-soft mt-auto rounded-xl p-4">
          <p className="text-sm font-medium text-slate-800">Your workspace</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Only you can see and manage the projects you create.
          </p>
        </div>
      </aside>

      <main className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between border-b border-white/65 bg-white/55 px-5 backdrop-blur-2xl sm:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <FolderKanban aria-hidden="true" size={17} />
            <span>My Workspace</span>
            <ArrowUpRight aria-hidden="true" className="text-slate-300" size={14} />
          </div>
          <div className="flex items-center gap-3">
            <span
              className="hidden max-w-64 truncate rounded-full border border-white/70 bg-white/45 px-3 py-1.5 text-xs text-slate-600 sm:block"
              title={email}
            >
              {email}
            </span>
            <form action={signOut}>
              <button
                aria-label="Sign out"
                className="rounded-lg border border-transparent p-2 text-slate-500 transition hover:border-white/70 hover:bg-white/70 hover:text-slate-800"
                title="Sign out"
                type="submit"
              >
                <LogOut aria-hidden="true" size={18} />
              </button>
            </form>
          </div>
        </header>

        <nav
          aria-label="Workspace"
          className="flex gap-2 border-b border-white/60 bg-white/45 px-5 py-2 backdrop-blur-xl lg:hidden sm:px-8"
        >
          <button
            aria-current={currentView === "projects" ? "page" : undefined}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
              currentView === "projects"
                ? "bg-[#E6F2DD]/85 text-[#486F66] shadow-sm"
                : "text-slate-600 hover:bg-white/60"
            }`}
            onClick={() => setCurrentView("projects")}
            type="button"
          >
            <Layers3 aria-hidden="true" size={16} />
            My projects
          </button>
          <button
            aria-current={currentView === "calendar" ? "page" : undefined}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
              currentView === "calendar"
                ? "bg-[#E6F2DD]/85 text-[#486F66] shadow-sm"
                : "text-slate-600 hover:bg-white/60"
            }`}
            onClick={() => setCurrentView("calendar")}
            type="button"
          >
            <CalendarDays aria-hidden="true" size={16} />
            Schedule calendar
          </button>
          {isManager && (
            <Link
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white/60"
              href="/manager"
            >
              <ShieldCheck aria-hidden="true" size={16} />
              Manager
            </Link>
          )}
        </nav>

        <div className="mx-auto max-w-[1600px] px-5 py-8 sm:px-8 sm:py-10">
          {currentView === "calendar" ? (
            <ScheduleCalendar reminders={reminders} today={today} />
          ) : (
            <>
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full border border-[#B1D3B9]/80 bg-white/55 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#486F66] shadow-sm backdrop-blur">
                    <Activity aria-hidden="true" size={14} />
                    YOUR PROJECT OVERVIEW
                  </p>
                  <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                    My Workspace
                  </h1>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                    Organize projects by where they are in the journey.
                  </p>
                </div>
                <button
                  className="palette-button inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#659287] focus:ring-offset-2 focus:ring-offset-transparent"
                  onClick={() => setShowAddProject(true)}
                  type="button"
                >
                  <Plus aria-hidden="true" size={17} />
                  Add project
                </button>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <SummaryCard
                  icon={FolderKanban}
                  iconStyle="bg-[#E6F2DD]/90 text-[#486F66]"
                  label="Total projects"
                  value={projects.length}
                />
                <SummaryCard
                  icon={Activity}
                  iconStyle="bg-[#B1D3B9]/65 text-[#486F66]"
                  label="In progress"
                  value={
                    projects.filter((project) => project.status === "ONGOING")
                      .length
                  }
                />
                <SummaryCard
                  icon={BadgeCheck}
                  iconStyle="bg-[#88BDA4]/35 text-[#486F66]"
                  label="Completed"
                  value={completedCount}
                />
              </div>

              <div className="mt-9 grid items-start gap-5 md:grid-cols-2 2xl:grid-cols-4">
                {sections.map(
                  ({ status, label, icon: Icon, color, emptyMessage }) => {
                    const sectionProjects = projects.filter(
                      (project) => project.status === status,
                    );

                    return (
                      <section
                        aria-labelledby={`section-${status}`}
                        className="glass-panel-soft min-w-0 rounded-2xl p-3.5"
                        key={status}
                      >
                        <div className="mb-3 flex items-center justify-between px-1 py-1">
                          <h2
                            className="flex items-center gap-2 text-sm font-semibold text-slate-800"
                            id={`section-${status}`}
                          >
                            <Icon
                              aria-hidden="true"
                              className={color}
                              size={17}
                            />
                            {label}
                          </h2>
                          <span className="rounded-full border border-white/80 bg-[#E6F2DD]/65 px-2.5 py-1 text-xs font-semibold text-[#486F66] shadow-sm">
                            {sectionProjects.length}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {sectionProjects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                          ))}
                          {sectionProjects.length === 0 && (
                            <div className="rounded-xl border border-dashed border-white/90 bg-[#E6F2DD]/45 px-4 py-7 text-center backdrop-blur">
                              <p className="text-sm font-medium text-slate-600">
                                No {label.toLowerCase()} projects yet
                              </p>
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                {emptyMessage}
                              </p>
                            </div>
                          )}
                        </div>
                      </section>
                    );
                  },
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {showAddProject && (
        <AddProjectDialog
          onClose={closeAddProject}
          onCreated={closeAddProject}
        />
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  iconStyle,
  label,
  value,
}: {
  icon: typeof CircleDot;
  iconStyle: string;
  label: string;
  value: number;
}) {
  return (
    <div className="glass-panel rounded-2xl p-5 transition duration-200 hover:-translate-y-0.5 hover:bg-white/75">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
        <span className={`flex size-11 items-center justify-center rounded-xl ${iconStyle}`}>
          <Icon aria-hidden="true" size={20} />
        </span>
      </div>
    </div>
  );
}
