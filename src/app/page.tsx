import Link from "next/link";
import { ContourBackground } from "@/components/landing/contour-background";
import { ObsidianEarth } from "@/components/landing/obsidian-earth";

export default function Landing() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06070b] text-white">
      {/* Ink contour topography */}
      <div className="absolute inset-0 opacity-60 animate-drift">
        <ContourBackground />
      </div>

      {/* Ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 40% at 50% 38%, rgba(70,95,200,0.18), transparent 70%), radial-gradient(40% 40% at 80% 90%, rgba(30,140,150,0.12), transparent 70%)",
        }}
      />

      {/* Watermark kanji */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[44vh] leading-none text-white/[0.025]"
      >
        墨
      </span>

      {/* Grain */}
      <div className="grain pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay" />

      {/* Glass nav */}
      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <span className="glass-tile flex h-9 w-9 items-center justify-center rounded-xl font-display text-lg text-white/90">
            墨
          </span>
          <span className="font-display text-lg tracking-wide text-white/90">
            Babra
          </span>
        </div>
        <Link
          href="/leads"
          className="glass rounded-full px-5 py-2 text-sm font-medium text-white/85 transition-colors hover:text-white"
        >
          Enter app
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-4xl flex-col items-center justify-center px-6 pb-16 text-center">
        <p className="animate-rise mb-2 text-xs font-medium uppercase tracking-[0.4em] text-white/45">
          序 · Advisory, distilled
        </p>

        {/* Obsidian Earth */}
        <div className="animate-rise relative h-[clamp(280px,46vh,460px)] w-[clamp(280px,46vh,460px)] [animation-delay:120ms]">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(80,110,230,0.35), transparent 62%)",
            }}
          />
          <ObsidianEarth />
        </div>

        <h1 className="animate-rise -mt-6 font-display text-6xl font-extrabold tracking-tight sm:text-7xl [animation-delay:200ms]">
          <span className="ink-text">Babra</span>
        </h1>

        <p className="animate-rise mt-5 max-w-xl text-balance text-base leading-relaxed text-white/55 sm:text-lg [animation-delay:300ms]">
          Leads, meetings, and client profiles — drawn together into one calm,
          flowing workspace for the modern financial advisor.
        </p>

        <div className="animate-rise mt-9 flex items-center gap-3 [animation-delay:400ms]">
          <Link
            href="/leads"
            className="group relative overflow-hidden rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
          >
            Enter workspace
            <span className="ml-1.5 inline-block transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
          <Link
            href="/clients"
            className="glass rounded-full px-7 py-3 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            View clients
          </Link>
        </div>
      </section>
    </main>
  );
}
