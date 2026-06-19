"use client";

import { useMemo, useState } from "react";
import type { Lead, LeadStatus } from "@/lib/leads";
import { STATUS_ORDER } from "@/lib/leads";
import { LeadCard } from "./lead-card";
import { LeadDrawer } from "./lead-drawer";

type Filter = "All" | LeadStatus;

export function LeadsBoard({ leads }: { leads: Lead[] }) {
  const [selected, setSelected] = useState<Lead | null>(null);
  const [filter, setFilter] = useState<Filter>("All");

  const filters: Filter[] = ["All", ...STATUS_ORDER];

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: leads.length };
    for (const status of STATUS_ORDER) {
      map[status] = leads.filter((l) => l.status === status).length;
    }
    return map;
  }, [leads]);

  const visible = useMemo(
    () => (filter === "All" ? leads : leads.filter((l) => l.status === filter)),
    [leads, filter]
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Leads
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Potential clients interested in your services. Click a card for full
          details.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-white text-zinc-600 ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-800 dark:hover:bg-zinc-800"
            }`}
          >
            {f}
            <span className="ml-1.5 text-xs opacity-60">{counts[f]}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            selected={selected?.id === lead.id}
            onSelect={setSelected}
          />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No leads in this stage.
        </p>
      )}

      <LeadDrawer lead={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
