import Link from "next/link";
import type { Client } from "@/lib/clients";
import { CLIENT_STATUS_STYLES } from "@/lib/clients";
import { avatarGradient, formatCurrency, initials } from "@/lib/format";

export function ClientCard({ client }: { client: Client }) {
  return (
    <Link
      href={`/clients/${client.slug}`}
      className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white ${avatarGradient(
              client.name
            )}`}
          >
            {initials(client.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-zinc-900 dark:text-zinc-50">
              {client.name}
            </p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {client.occupation}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
            CLIENT_STATUS_STYLES[client.status]
          }`}
        >
          {client.status}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Assets under management
          </p>
          <p className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {formatCurrency(client.aum)}
          </p>
        </div>
        <span className="text-sm text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-indigo-400">
          View →
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {client.serviceTopics.map((topic) => (
          <span
            key={topic}
            className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          >
            {topic}
          </span>
        ))}
      </div>
    </Link>
  );
}
