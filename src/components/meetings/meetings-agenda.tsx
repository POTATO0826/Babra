"use client";

import { useMemo, useState } from "react";
import type { Meeting } from "@/lib/meetings";
import { dayKey, formatDayLabel } from "@/lib/format";
import { MeetingRow } from "./meeting-row";
import { MeetingDrawer } from "./meeting-drawer";

type View = "Upcoming" | "Past";

type DayGroup = {
  key: string;
  label: string;
  meetings: Meeting[];
};

export function MeetingsAgenda({ meetings }: { meetings: Meeting[] }) {
  const [selected, setSelected] = useState<Meeting | null>(null);
  const [view, setView] = useState<View>("Upcoming");
  // Snapshot "now" once so server and client render the same groupings.
  const [now] = useState(() => new Date());

  const groups = useMemo<DayGroup[]>(() => {
    const nowMs = now.getTime();
    const filtered = meetings
      .filter((m) =>
        view === "Upcoming"
          ? new Date(m.start).getTime() >= nowMs
          : new Date(m.start).getTime() < nowMs
      )
      .sort((a, b) =>
        view === "Upcoming"
          ? new Date(a.start).getTime() - new Date(b.start).getTime()
          : new Date(b.start).getTime() - new Date(a.start).getTime()
      );

    const byDay = new Map<string, DayGroup>();
    for (const m of filtered) {
      const key = dayKey(m.start);
      let group = byDay.get(key);
      if (!group) {
        group = { key, label: formatDayLabel(m.start, now), meetings: [] };
        byDay.set(key, group);
      }
      group.meetings.push(m);
    }
    return [...byDay.values()];
  }, [meetings, view, now]);

  const upcomingCount = useMemo(
    () =>
      meetings.filter((m) => new Date(m.start).getTime() >= now.getTime())
        .length,
    [meetings, now]
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Meetings
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {upcomingCount} upcoming{" "}
          {upcomingCount === 1 ? "meeting" : "meetings"}. Click one for full
          details.
        </p>
      </header>

      {/* View toggle */}
      <div className="mb-6 inline-flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        {(["Upcoming", "Past"] as View[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              view === v
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <p className="py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No {view.toLowerCase()} meetings.
        </p>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.key}>
              <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                {group.label}
              </h2>
              <div className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
                {group.meetings.map((meeting) => (
                  <MeetingRow
                    key={meeting.id}
                    meeting={meeting}
                    selected={selected?.id === meeting.id}
                    onSelect={setSelected}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <MeetingDrawer meeting={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
