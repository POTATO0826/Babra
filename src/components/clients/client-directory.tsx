"use client";

import { useMemo, useState } from "react";
import type { Client } from "@/lib/clients";
import { formatCurrency } from "@/lib/format";
import { ClientCard } from "./client-card";

export function ClientDirectory({ clients }: { clients: Client[] }) {
  const [query, setQuery] = useState("");

  const totalAum = useMemo(
    () => clients.reduce((sum, c) => sum + c.aum, 0),
    [clients]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.occupation.toLowerCase().includes(q) ||
        c.serviceTopics.some((t) => t.toLowerCase().includes(q))
    );
  }, [clients, query]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Client Profiles
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {clients.length} clients · {formatCurrency(totalAum)} total AUM
          </p>
        </div>

        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients…"
            aria-label="Search clients"
            className="w-64 rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No clients match “{query}”.
        </p>
      )}
    </div>
  );
}
