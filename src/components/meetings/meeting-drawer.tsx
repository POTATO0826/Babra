"use client";

import { useEffect } from "react";
import type { Meeting } from "@/lib/meetings";
import {
  MEETING_STATUS_STYLES,
  MODE_STYLES,
  avatarGradient,
  formatDayLabel,
  formatTime,
  initials,
} from "@/lib/format";
import { ModeIcon } from "./mode-icon";

export function MeetingDrawer({
  meeting,
  onClose,
}: {
  meeting: Meeting | null;
  onClose: () => void;
}) {
  const open = meeting !== null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const endTime = meeting
    ? new Date(
        new Date(meeting.start).getTime() + meeting.durationMinutes * 60_000
      ).toISOString()
    : null;

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={`fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={meeting ? `${meeting.title} details` : "Meeting details"}
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-zinc-900 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {meeting && endTime && (
          <>
            <header className="border-b border-zinc-200 p-6 dark:border-zinc-800">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      MODE_STYLES[meeting.mode]
                    }`}
                  >
                    <ModeIcon mode={meeting.mode} className="h-3.5 w-3.5" />
                    {meeting.mode}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      MEETING_STATUS_STYLES[meeting.status]
                    }`}
                  >
                    {meeting.status}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close panel"
                  className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    aria-hidden
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <h2 className="mt-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {meeting.title}
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {formatDayLabel(meeting.start)} · {formatTime(meeting.start)} –{" "}
                {formatTime(endTime)}
              </p>
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <Section title="With">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white ${avatarGradient(
                      meeting.attendee
                    )}`}
                  >
                    {initials(meeting.attendee)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {meeting.attendee}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {meeting.attendeeRole}
                    </p>
                  </div>
                </div>
              </Section>

              <div className="grid grid-cols-2 gap-3">
                <Fact label={meeting.mode === "In-person" ? "Location" : "Where"}>
                  {meeting.location}
                </Fact>
                <Fact label="Duration">{meeting.durationMinutes} minutes</Fact>
                <Fact label="Topic">{meeting.topic}</Fact>
                <Fact label="Status">{meeting.status}</Fact>
              </div>

              <Section title="Purpose">
                <p className="rounded-lg border-l-2 border-indigo-400 bg-indigo-50/60 p-3 text-sm leading-relaxed text-zinc-700 dark:bg-indigo-500/10 dark:text-zinc-300">
                  {meeting.purpose}
                </p>
              </Section>

              <Section title="Agenda">
                <ul className="space-y-2">
                  {meeting.agenda.map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Section>
            </div>

            <footer className="flex gap-3 border-t border-zinc-200 p-4 dark:border-zinc-800">
              {meeting.mode === "Video" ? (
                <button
                  type="button"
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
                >
                  Join call
                </button>
              ) : (
                <button
                  type="button"
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
                >
                  View details
                </button>
              )}
              <button
                type="button"
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Reschedule
              </button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}

function Fact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {children}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
        {title}
      </h3>
      {children}
    </section>
  );
}
