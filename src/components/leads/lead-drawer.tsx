"use client";

import { useEffect } from "react";
import type { Lead } from "@/lib/leads";
import {
  STATUS_STYLES,
  avatarGradient,
  formatCurrency,
  formatDate,
  initials,
} from "@/lib/format";

export function LeadDrawer({
  lead,
  onClose,
}: {
  lead: Lead | null;
  onClose: () => void;
}) {
  const open = lead !== null;

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden
        className={`fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={lead ? `${lead.name} details` : "Lead details"}
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-zinc-900 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {lead && (
          <>
            <header className="flex items-start justify-between gap-4 border-b border-zinc-200 p-6 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-lg font-semibold text-white ${avatarGradient(
                    lead.name
                  )}`}
                >
                  {initials(lead.name)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {lead.name}
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {lead.occupation} · {lead.age}
                  </p>
                  <span
                    className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      STATUS_STYLES[lead.status]
                    }`}
                  >
                    {lead.status}
                  </span>
                </div>
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
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {/* Key facts */}
              <div className="grid grid-cols-2 gap-3">
                <Fact label="Est. portfolio">
                  {formatCurrency(lead.estimatedPortfolio)}
                </Fact>
                <Fact label="Service interest">{lead.serviceInterest}</Fact>
                <Fact label="Source">{lead.source}</Fact>
                <Fact label="Location">{lead.location}</Fact>
                <Fact label="Added">{formatDate(lead.addedDate)}</Fact>
                <Fact label="Last contact">{formatDate(lead.lastContact)}</Fact>
              </div>

              <Section title="Contact">
                <ul className="space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                  <li>
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {lead.email}
                    </a>
                  </li>
                  <li>
                    <a
                      href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}
                      className="text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {lead.phone}
                    </a>
                  </li>
                </ul>
              </Section>

              <Section title="Situation">
                <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {lead.situation}
                </p>
              </Section>

              <Section title="Why they approached us">
                <p className="rounded-lg border-l-2 border-indigo-400 bg-indigo-50/60 p-3 text-sm leading-relaxed text-zinc-700 dark:bg-indigo-500/10 dark:text-zinc-300">
                  {lead.whyApproached}
                </p>
              </Section>

              <Section title="Notes">
                <ul className="space-y-2">
                  {lead.notes.map((note, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                      {note}
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="Activity">
                <ol className="space-y-3">
                  {[...lead.timeline].reverse().map((event, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                        {i < lead.timeline.length - 1 && (
                          <span className="w-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
                        )}
                      </div>
                      <div className="-mt-1 pb-1">
                        <p className="text-sm text-zinc-800 dark:text-zinc-200">
                          {event.label}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {formatDate(event.date)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Section>
            </div>

            <footer className="flex gap-3 border-t border-zinc-200 p-4 dark:border-zinc-800">
              <button
                type="button"
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
              >
                Schedule meeting
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Convert to client
              </button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
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
