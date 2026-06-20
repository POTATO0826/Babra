"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import type { Meeting } from "@/lib/meetings";
import { dayKey, formatDayLabel, formatLongDate } from "@/lib/format";
import {
  getCreatedMeetingsServerSnapshot,
  loadCreatedMeetings,
  subscribeToCreatedMeetings,
} from "@/lib/meeting-storage";
import { MeetingRow } from "./meeting-row";
import { MeetingDrawer } from "./meeting-drawer";
import { MeetingsCalendar } from "./meetings-calendar";
import { AgendaIcon, CalendarIcon, Plus } from "@/components/icons";

type Layout = "Agenda" | "Calendar";
type View = "Upcoming" | "Past";

type DayGroup = {
  key: string;
  label: string;
  dateLine: string;
  meetings: Meeting[];
};

export function MeetingsAgenda({ meetings: initialMeetings }: { meetings: Meeting[] }) {
  const createdMeetings = useSyncExternalStore(
    subscribeToCreatedMeetings,
    loadCreatedMeetings,
    getCreatedMeetingsServerSnapshot
  );
  const meetings = useMemo(
    () => [
      ...createdMeetings,
      ...initialMeetings.filter(
        (meeting) => !createdMeetings.some((item) => item.id === meeting.id)
      ),
    ],
    [createdMeetings, initialMeetings]
  );
  const [selected, setSelected] = useState<Meeting | null>(null);
  const [layout, setLayout] = useState<Layout>("Agenda");
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
        group = {
          key,
          label: formatDayLabel(m.start, now),
          dateLine: formatLongDate(m.start),
          meetings: [],
        };
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
  const pastCount = meetings.length - upcomingCount;

  // The very first upcoming meeting gets a "next" accent rail.
  const nextId =
    layout === "Agenda" && view === "Upcoming"
      ? groups[0]?.meetings[0]?.id
      : undefined;

  return (
    <section className="mx-auto max-w-[980px] px-14 pb-20 pt-12">
      <header className="relative mb-[30px] flex items-end justify-between gap-6 overflow-hidden border-b border-line pb-[26px]">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-[90px] h-[200px] w-[280px] opacity-50 blur-[30px]"
          style={{
            background:
              "radial-gradient(55% 70% at 70% 30%, rgba(52,84,140,0.22), transparent 70%), radial-gradient(45% 55% at 40% 60%, rgba(156,59,51,0.14), transparent 72%)",
          }}
        />
        <div className="relative">
          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-dim">
            Schedule
          </div>
          <h1 className="m-0 font-serif text-[38px] font-medium leading-none tracking-[-0.01em] text-[#231F17]">
            Meetings
          </h1>
          <p className="mt-3 text-[14.5px] text-muted">
            {upcomingCount} upcoming {upcomingCount === 1 ? "meeting" : "meetings"}
          </p>
        </div>

        <Link
          href="/meetings/new"
          className="relative inline-flex items-center gap-2 rounded-xl bg-[#231F17] px-4 py-[10px] text-[13px] font-semibold text-[#F8F4EC] shadow-[0_12px_22px_-15px_rgba(35,31,23,0.6)] transition hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          New meeting
        </Link>
      </header>

      <div className="mb-7 flex min-h-[45px] items-start justify-between gap-6 border-b border-line">
        {layout === "Agenda" ? (
          <AgendaTabs
            value={view}
            onChange={setView}
            upcomingCount={upcomingCount}
            pastCount={pastCount}
          />
        ) : (
          <div className="pb-3 text-[12.5px] font-semibold text-quiet">
            Monthly overview
          </div>
        )}
        <LayoutSwitch value={layout} onChange={setLayout} />
      </div>

      {layout === "Calendar" ? (
        <MeetingsCalendar
          meetings={meetings}
          now={now}
          onSelect={setSelected}
        />
      ) : (
        <>
          {groups.length === 0 ? (
            <div className="px-5 py-20 text-center text-quiet">
              <div className="mb-2 font-serif text-[21px] text-muted">
                Nothing on the calendar
              </div>
              <div className="text-sm">
                No {view.toLowerCase()} meetings to show.
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-[26px]">
              {groups.map((group) => (
                <section key={group.key}>
                  <div className="mb-3 flex items-baseline gap-3 pl-0.5">
                    <h2 className="m-0 font-serif text-[19px] font-medium text-ink-soft">
                      {group.label}
                    </h2>
                    <span className="text-xs font-medium tracking-[0.04em] text-dim">
                      {group.dateLine}
                    </span>
                  </div>
                  <div className="glass-card overflow-hidden rounded-[15px] border">
                    {group.meetings.map((meeting, i) => (
                      <MeetingRow
                        key={meeting.id}
                        meeting={meeting}
                        now={now}
                        first={i === 0}
                        isNext={meeting.id === nextId}
                        onSelect={setSelected}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}

      <MeetingDrawer
        meeting={selected}
        now={now}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}

function LayoutSwitch({
  value,
  onChange,
}: {
  value: Layout;
  onChange: (value: Layout) => void;
}) {
  const options = [
    { value: "Agenda" as const, icon: AgendaIcon },
    { value: "Calendar" as const, icon: CalendarIcon },
  ];

  return (
    <div
      className="glass-card relative -mt-1 flex rounded-[13px] border p-1"
      aria-label="Meeting layout"
    >
      {options.map((option) => {
        const active = value === option.value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`relative flex items-center gap-2 rounded-[9px] px-4 py-2 text-[13px] font-semibold transition-all ${
              active
                ? "bg-[#FCFAF5]/80 text-ink shadow-[0_1px_3px_rgba(38,34,25,0.12)]"
                : "text-quiet hover:text-muted"
            }`}
          >
            <Icon className="h-4 w-4" />
            {option.value}
          </button>
        );
      })}
    </div>
  );
}

function AgendaTabs({
  value,
  onChange,
  upcomingCount,
  pastCount,
}: {
  value: View;
  onChange: (value: View) => void;
  upcomingCount: number;
  pastCount: number;
}) {
  const options = [
    { value: "Upcoming" as const, count: upcomingCount },
    { value: "Past" as const, count: pastCount },
  ];

  return (
    <div
      className="flex items-center gap-7"
      role="tablist"
      aria-label="Agenda timeframe"
    >
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={`relative flex items-center gap-2 pb-3 text-[13px] font-semibold transition-colors ${
              active ? "text-ink" : "text-quiet hover:text-muted"
            }`}
          >
            {option.value}
            <span
              className={`rounded-full px-2 py-0.5 text-[10.5px] tabular-nums ${
                active
                  ? "bg-accent/10 text-accent"
                  : "bg-black/[0.035] text-dim"
              }`}
            >
              {option.count}
            </span>
            {active && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent" />
            )}
          </button>
        );
      })}
    </div>
  );
}
