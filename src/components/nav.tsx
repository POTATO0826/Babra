"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/leads", label: "Leads", glyph: "引", icon: UsersIcon },
  { href: "/meetings", label: "Meetings", glyph: "会", icon: CalendarIcon },
  { href: "/clients", label: "Client Profiles", glyph: "客", icon: IdIcon },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <aside className="z-20 flex w-64 shrink-0 flex-col px-4 py-6">
      <div className="glass flex h-full flex-col rounded-2xl px-3 py-5">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-3 px-2">
          <span className="glass-tile flex h-9 w-9 items-center justify-center rounded-xl font-display text-lg text-white/90 shadow-[0_0_20px_-4px_rgba(120,150,255,0.5)]">
            墨
          </span>
          <span className="font-display text-lg tracking-wide text-white/90">
            Babra
          </span>
        </Link>

        <nav className="mt-8 flex flex-col gap-1.5">
          {links.map(({ href, label, glyph, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-all ${
                  active
                    ? "glass-tile text-white shadow-[0_0_24px_-8px_rgba(120,150,255,0.7)]"
                    : "text-white/55 hover:bg-white/[0.04] hover:text-white/90"
                }`}
              >
                <span
                  className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                    active
                      ? "bg-white/[0.07] text-indigo-200"
                      : "bg-white/[0.03] text-white/60 group-hover:text-white/90"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  <span className="pointer-events-none absolute -right-0.5 -top-0.5 font-display text-[9px] leading-none text-white/30">
                    {glyph}
                  </span>
                </span>
                <span className="font-medium tracking-wide">{label}</span>
                {active && (
                  <span className="absolute right-2 h-1.5 w-1.5 rounded-full bg-indigo-300 shadow-[0_0_8px_2px_rgba(160,180,255,0.6)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex items-center gap-3 border-t border-white/10 px-1 pt-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400/80 to-violet-500/80 text-xs font-semibold text-white">
            FA
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white/85">
              Financial Advisor
            </p>
            <p className="truncate text-xs text-white/40">Your workspace</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function IdIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="11" r="2" />
      <path d="M13 9h5M13 13h3M5 16h8" />
    </svg>
  );
}
