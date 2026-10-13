"use client";

import { useActionState, useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  createReminder,
  deleteReminder,
  type ReminderActionState,
} from "@/app/reminders/actions";

export type ReminderData = {
  id: string;
  title: string;
  description: string | null;
  date: string;
};

type ScheduleCalendarProps = {
  reminders: ReminderData[];
  today: string;
};

const initialReminderState: ReminderActionState = {};
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateKey(date: Date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function fromDateKey(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatDate(value: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en", {
    ...options,
    timeZone: "UTC",
  }).format(fromDateKey(value));
}

function AddReminderDialog({
  date,
  onClose,
}: {
  date: string;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    createReminder,
    initialReminderState,
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (state.success) onClose();
  }, [onClose, state.success]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="add-reminder-title"
        aria-modal="true"
        className="glass-panel my-auto w-full max-w-lg rounded-2xl bg-white/85 p-6 shadow-2xl sm:p-8"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              className="text-xl font-semibold tracking-tight text-slate-950"
              id="add-reminder-title"
            >
              Add a reminder
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {formatDate(date, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            aria-label="Close add reminder dialog"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <form action={formAction} className="mt-6 space-y-5">
          <input name="date" type="hidden" value={date} />
          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="reminder-title"
            >
              Reminder
            </label>
            <input
              autoFocus
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#659287] focus:ring-2 focus:ring-[#B1D3B9]/60"
              id="reminder-title"
              maxLength={120}
              name="title"
              placeholder="e.g. Send the project update"
              required
            />
          </div>
          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="reminder-description"
            >
              Notes <span className="font-normal text-slate-400">Optional</span>
            </label>
            <textarea
              className="min-h-24 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#659287] focus:ring-2 focus:ring-[#B1D3B9]/60"
              id="reminder-description"
              maxLength={1000}
              name="description"
              placeholder="Add any details you want to remember."
              rows={3}
            />
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
              className="palette-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={pending}
              type="submit"
            >
              <Plus aria-hidden="true" size={16} />
              {pending ? "Saving..." : "Add reminder"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function ScheduleCalendar({ reminders, today }: ScheduleCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const current = fromDateKey(today);
    return new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), 1));
  });
  const [showAddReminder, setShowAddReminder] = useState(false);

  const year = visibleMonth.getUTCFullYear();
  const month = visibleMonth.getUTCMonth();
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  const calendarDays = Array.from({ length: cellCount }, (_, index) => {
    const day = new Date(Date.UTC(year, month, 1 - firstWeekday + index));
    return {
      date: toDateKey(day),
      day: day.getUTCDate(),
      isCurrentMonth: day.getUTCMonth() === month,
    };
  });
  const selectedReminders = reminders.filter(
    (reminder) => reminder.date === selectedDate,
  );
  const reminderCounts = new Map<string, number>();

  for (const reminder of reminders) {
    reminderCounts.set(
      reminder.date,
      (reminderCounts.get(reminder.date) ?? 0) + 1,
    );
  }

  function changeMonth(offset: number) {
    const nextMonth = new Date(Date.UTC(year, month + offset, 1));
    const nextDate = toDateKey(nextMonth);
    setVisibleMonth(nextMonth);
    setSelectedDate(nextDate);
  }

  function selectDate(date: string, isCurrentMonth: boolean) {
    setSelectedDate(date);
    if (!isCurrentMonth) {
      const selected = fromDateKey(date);
      setVisibleMonth(
        new Date(
          Date.UTC(selected.getUTCFullYear(), selected.getUTCMonth(), 1),
        ),
      );
    }
  }

  return (
    <section className="mt-4" aria-labelledby="schedule-calendar-title">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <span className="hidden size-14 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-[#E6F2DD]/60 text-[#659287] shadow-lg shadow-[#659287]/10 backdrop-blur-xl sm:flex">
            <Sparkles aria-hidden="true" size={24} />
          </span>
          <div>
          <p className="inline-flex rounded-full border border-[#B1D3B9]/80 bg-white/55 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#486F66] shadow-sm backdrop-blur">
            YOUR SCHEDULE
          </p>
          <h2
            className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl"
            id="schedule-calendar-title"
          >
            Schedule calendar
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Mark important dates and keep your reminders in one place.
          </p>
          </div>
        </div>
        <button
          className="palette-button inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#659287] focus:ring-offset-2 focus:ring-offset-transparent"
          onClick={() => setShowAddReminder(true)}
          type="button"
        >
          <Plus aria-hidden="true" size={17} />
          Add reminder
        </button>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(18rem,0.8fr)]">
        <div className="glass-panel rounded-2xl p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CalendarDays
                aria-hidden="true"
                className="text-[#659287]"
                size={20}
              />
              <h3 className="text-lg font-semibold text-slate-900">
                {formatDate(toDateKey(visibleMonth), {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                aria-label="Go to today"
                className="mr-1 rounded-lg border border-white/70 bg-white/45 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-white/80"
                onClick={() => {
                  const current = fromDateKey(today);
                  setSelectedDate(today);
                  setVisibleMonth(
                    new Date(
                      Date.UTC(
                        current.getUTCFullYear(),
                        current.getUTCMonth(),
                        1,
                      ),
                    ),
                  );
                }}
                type="button"
              >
                Today
              </button>
              <button
                aria-label="Previous month"
                className="rounded-lg border border-transparent p-2 text-slate-600 transition hover:border-white/70 hover:bg-white/75"
                onClick={() => changeMonth(-1)}
                type="button"
              >
                <ChevronLeft aria-hidden="true" size={18} />
              </button>
              <button
                aria-label="Next month"
                className="rounded-lg border border-transparent p-2 text-slate-600 transition hover:border-white/70 hover:bg-white/75"
                onClick={() => changeMonth(1)}
                type="button"
              >
                <ChevronRight aria-hidden="true" size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7" role="grid">
            {weekdays.map((weekday) => (
              <div
                aria-label={weekday}
                className="pb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                key={weekday}
                role="columnheader"
              >
                {weekday}
              </div>
            ))}
            {calendarDays.map(({ date, day, isCurrentMonth }) => {
              const count = reminderCounts.get(date) ?? 0;
              const isSelected = date === selectedDate;
              const isToday = date === today;

              return (
                <div className="border-t border-white/60 p-1" key={date} role="gridcell">
                  <button
                    aria-current={isToday ? "date" : undefined}
                    aria-label={`${formatDate(date, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}${count ? `, ${count} reminder${count === 1 ? "" : "s"}` : ""}`}
                    aria-pressed={isSelected}
                    className={`flex min-h-12 w-full flex-col items-center justify-center rounded-lg text-sm transition sm:min-h-14 ${
                      isSelected
                        ? "bg-[#659287] font-semibold text-white shadow-md shadow-[#659287]/20"
                        : isToday
                          ? "bg-[#E6F2DD]/90 font-semibold text-[#486F66] ring-1 ring-inset ring-[#B1D3B9]/80"
                          : isCurrentMonth
                          ? "text-slate-700 hover:bg-white/75"
                          : "text-slate-300 hover:bg-white/40"
                    }`}
                    onClick={() => selectDate(date, isCurrentMonth)}
                    type="button"
                  >
                    <span>{day}</span>
                    {count > 0 && (
                      <span
                        aria-hidden="true"
                        className={`mt-1 size-1.5 rounded-full ${
                          isSelected ? "bg-white" : "bg-[#659287]"
                        }`}
                      />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="glass-panel rounded-2xl p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#659287]">
                Selected day
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">
                {formatDate(selectedDate, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
            </div>
            <span className="rounded-full border border-white/80 bg-white/65 px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
              {selectedReminders.length}
            </span>
          </div>

          <button
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#B1D3B9]/80 bg-white/45 px-3 py-2.5 text-sm font-semibold text-[#486F66] shadow-sm transition hover:bg-[#E6F2DD]/75"
            onClick={() => setShowAddReminder(true)}
            type="button"
          >
            <Plus aria-hidden="true" size={16} />
            Add reminder for this day
          </button>

          <div className="mt-5 space-y-3">
            {selectedReminders.map((reminder) => (
              <article
                className="rounded-xl border border-white/80 bg-[#E6F2DD]/45 p-4 shadow-sm shadow-[#659287]/10 backdrop-blur-lg"
                key={reminder.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="break-words text-sm font-semibold text-slate-800">
                    {reminder.title}
                  </h4>
                  <form action={deleteReminder}>
                    <input name="id" type="hidden" value={reminder.id} />
                    <button
                      aria-label={`Delete reminder: ${reminder.title}`}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50/80 hover:text-rose-600"
                      title="Delete reminder"
                      type="submit"
                    >
                      <Trash2 aria-hidden="true" size={15} />
                    </button>
                  </form>
                </div>
                {reminder.description && (
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-5 text-slate-600">
                    {reminder.description}
                  </p>
                )}
              </article>
            ))}
            {selectedReminders.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/90 bg-white/35 px-4 py-8 text-center">
                <p className="text-sm font-medium text-slate-600">
                  No reminders for this day
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Add one to mark this date on your calendar.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {showAddReminder && (
        <AddReminderDialog
          date={selectedDate}
          onClose={() => setShowAddReminder(false)}
        />
      )}
    </section>
  );
}
