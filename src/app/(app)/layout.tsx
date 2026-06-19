import { Nav } from "@/components/nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-screen overflow-hidden bg-[#06070b]">
      {/* Ambient obsidian glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 50% at 15% 0%, rgba(60,80,160,0.16), transparent 70%), radial-gradient(50% 50% at 100% 100%, rgba(40,120,140,0.12), transparent 70%)",
        }}
      />
      <Nav />
      <main className="relative z-10 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
