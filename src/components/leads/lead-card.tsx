import type { Lead } from "@/lib/leads";
import {
  STATUS_STYLES,
  avatarGradient,
  formatRelative,
  initials,
} from "@/lib/format";

export function LeadCard({
  lead,
  selected,
  onSelect,
}: {
  lead: Lead;
  selected: boolean;
  onSelect: (lead: Lead) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(lead)}
      aria-pressed={selected}
      className={`group flex h-full flex-col rounded-xl border bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-900 ${
        selected
          ? "border-indigo-400 ring-2 ring-indigo-400/40 dark:border-indigo-500"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white ${avatarGradient(
              lead.name
            )}`}
          >
            {initials(lead.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-zinc-900 dark:text-zinc-50">
              {lead.name}
            </p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {lead.occupation}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
            STATUS_STYLES[lead.status]
          }`}
        >
          {lead.status}
        </span>
      </div>

      <p className="mt-4 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-300">
        {lead.situationTeaser}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {lead.serviceInterest}
        </span>
        <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {lead.source}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <span>Last contact {formatRelative(lead.lastContact)}</span>
        <span className="text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-indigo-400">
          View →
        </span>
      </div>
    </button>
  );
}
