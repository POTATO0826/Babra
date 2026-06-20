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

  const advancing = (counts.Qualified ?? 0) + (counts.Proposal ?? 0);

  return (
    <section className="mx-auto max-w-[1180px] px-14 pb-20 pt-12">
      <header className="relative mb-[22px] flex items-end justify-between gap-6 overflow-hidden border-b border-line pb-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-[90px] h-[200px] w-[280px] opacity-50 blur-[30px]"
          style={{
            background:
              "radial-gradient(55% 70% at 70% 30%, rgba(52,84,140,0.20), transparent 70%), radial-gradient(45% 55% at 40% 60%, rgba(156,59,51,0.14), transparent 72%)",
          }}
        />
        <div className="relative">
          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-dim">
            Pipeline
          </div>
          <h1 className="m-0 font-serif text-[38px] font-medium leading-none tracking-[-0.01em] text-[#231F17]">
            Leads
          </h1>
          <p className="mt-3 text-[14.5px] text-muted">
            {leads.length} prospects · {advancing} advancing
          </p>
        </div>
      </header>

      <div className="mb-[26px] flex flex-wrap gap-2.5">
        {filters.map((f) => {
          const on = filter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className="inline-flex items-center gap-2 rounded-full border px-[15px] py-2 text-[13px] font-semibold transition-colors"
              style={{
                borderColor: on ? "#2A261D" : "#DAD3C4",
                background: on ? "#2A261D" : "transparent",
                color: on ? "#F4F0E6" : "#5C5446",
              }}
            >
              {f}
              <span
                className="text-[11.5px] font-semibold tabular-nums"
                style={{ color: on ? "rgba(244,240,230,0.6)" : "#A29A87" }}
              >
                {counts[f]}
              </span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="px-5 py-20 text-center text-quiet">
          <div className="mb-2 font-serif text-[21px] text-muted">
            No leads in this stage
          </div>
          <div className="text-sm">
            Try another filter to see more of the pipeline.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(330px,1fr))] gap-[18px]">
          {visible.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onSelect={setSelected} />
          ))}
        </div>
      )}

      <LeadDrawer lead={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
