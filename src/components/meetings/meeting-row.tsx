import type { Meeting } from "@/lib/meetings";
import {
  MODE_DOT,
  MODE_STYLES,
  avatarGradient,
  formatTime,
  initials,
} from "@/lib/format";
import { ModeIcon } from "./mode-icon";

export function MeetingRow({
  meeting,
  selected,
  onSelect,
}: {
  meeting: Meeting;
  selected: boolean;
  onSelect: (meeting: Meeting) => void;
}) {
  const canceled = meeting.status === "Canceled";

  return (
    <button
      type="button"
      onClick={() => onSelect(meeting)}
      aria-pressed={selected}
      className={`flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 ${
        selected
          ? "bg-indigo-50/70 dark:bg-indigo-500/10"
          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      }`}
    >
      {/* Time */}
      <div className="w-16 shrink-0 text-right">
        <p
          className={`text-sm font-semibold ${
            canceled
              ? "text-zinc-400 line-through dark:text-zinc-500"
              : "text-zinc-900 dark:text-zinc-100"
          }`}
        >
          {formatTime(meeting.start)}
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          {meeting.durationMinutes}m
        </p>
      </div>

      {/* Mode-colored rail */}
      <span
        className={`h-10 w-1 shrink-0 rounded-full ${MODE_DOT[meeting.mode]} ${
          canceled ? "opacity-40" : ""
        }`}
      />

      {/* Details */}
      <div className="min-w-0 flex-1">
        <p
          className={`truncate font-medium ${
            canceled
              ? "text-zinc-400 dark:text-zinc-500"
              : "text-zinc-900 dark:text-zinc-100"
          }`}
        >
          {meeting.title}
        </p>
        <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
          {meeting.attendee}
        </p>
      </div>

      {/* Attendee avatar */}
      <div
        className={`hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white sm:flex ${avatarGradient(
          meeting.attendee
        )}`}
      >
        {initials(meeting.attendee)}
      </div>

      {/* Mode badge */}
      <span
        className={`hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset sm:inline-flex ${
          MODE_STYLES[meeting.mode]
        }`}
      >
        <ModeIcon mode={meeting.mode} className="h-3.5 w-3.5" />
        {meeting.mode}
      </span>
    </button>
  );
}
