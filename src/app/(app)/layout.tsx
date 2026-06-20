import { Nav } from "@/components/nav";
import { InkBackground } from "@/components/backdrop/ink-background";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-screen overflow-hidden">
      <InkBackground />

      {/* Faint paper grain over everything */}
      <div
        aria-hidden
        className="paper-grain pointer-events-none fixed inset-0 z-[60] opacity-[0.035] mix-blend-multiply"
      />

      <Nav />
      <main className="relative z-[1] h-screen flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
