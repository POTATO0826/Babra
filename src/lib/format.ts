import type { LeadStatus } from "./leads";
import type { MeetingMode, MeetingStatus } from "./meetings";

/** Format a USD amount compactly, e.g. 850000 -> "$850K", 2400000 -> "$2.4M". */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

/** Format an ISO date as e.g. "Jun 16, 2026". */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Format a time as e.g. "9:00 AM". */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Calendar-day key (YYYY-MM-DD in local time) for grouping. */
export function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Day header label like "Today", "Tomorrow", "Yesterday", or "Mon, Jun 23". */
export function formatDayLabel(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const startOf = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(d) - startOf(now)) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** Relative time like "Today", "Yesterday", "3 days ago", "2 weeks ago". */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const days = Math.round(
    (now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const weeks = Math.round(days / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }
  const months = Math.round(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

/** Initials from a name, e.g. "Marcus Chen" -> "MC". */
export function initials(name: string): string {
  return name
    .replace(/&/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Tailwind classes for a status badge. */
export const STATUS_STYLES: Record<LeadStatus, string> = {
  New: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/30",
  Contacted:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/30",
  Qualified:
    "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/30",
  Proposal:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/30",
};

/** Accent color (left rail / time dot) for a meeting mode. */
export const MODE_DOT: Record<MeetingMode, string> = {
  Video: "bg-sky-500",
  Phone: "bg-amber-500",
  "In-person": "bg-emerald-500",
};

/** Tailwind classes for a meeting mode badge. */
export const MODE_STYLES: Record<MeetingMode, string> = {
  Video:
    "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/30",
  Phone:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/30",
  "In-person":
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/30",
};

/** Tailwind classes for a meeting status badge. */
export const MEETING_STATUS_STYLES: Record<MeetingStatus, string> = {
  Confirmed:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/30",
  Tentative:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/30",
  Completed:
    "bg-zinc-100 text-zinc-600 ring-zinc-500/20 dark:bg-zinc-700/40 dark:text-zinc-300 dark:ring-zinc-500/30",
  Canceled:
    "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/30",
};

/** Deterministic avatar gradient based on the name. */
export function avatarGradient(name: string): string {
  const gradients = [
    "from-indigo-500 to-purple-500",
    "from-sky-500 to-blue-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
    "from-violet-500 to-fuchsia-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash * 31;
  return gradients[Math.abs(hash) % gradients.length];
}
