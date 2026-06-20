import { avatarGradient, initials, statusMeta } from "@/lib/format";

/**
 * Shared button styling. Two primary looks across MEETU:
 *  - `ink`   — the dark, editorial primary action (replaces flat black).
 *  - `gold`  — the metallic accent action (AI / News).
 *  - `ghost` — a quiet glass secondary action.
 * Works on both <button> and <Link> via `className={buttonClass(...)}`.
 */
export type ButtonVariant = "ink" | "gold" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const BUTTON_BASE =
  "group relative inline-flex select-none items-center justify-center gap-2 rounded-xl font-semibold transition-[transform,box-shadow,background-color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 disabled:hover:shadow-none";

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-[13px]",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-[15px]",
};

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  ink: "text-[#F4F0E6] ring-1 ring-inset ring-white/10 [background:linear-gradient(160deg,#322D23_0%,#1B1813_55%,#131009_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_16px_34px_-18px_rgba(19,16,9,0.9)] hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_22px_46px_-18px_rgba(19,16,9,0.95)] active:translate-y-0 focus-visible:ring-[#231F17]/45",
  gold: "text-[#3A2C0A] border border-[#CBA23C] [background:linear-gradient(135deg,#FBEAA6_0%,#E9C766_42%,#C5972E_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_14px_30px_-14px_rgba(181,131,46,0.95)] hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_18px_38px_-14px_rgba(181,131,46,1)] active:translate-y-0 focus-visible:ring-[#B5832E]/45",
  ghost:
    "text-ink border border-[#1C1A16]/15 bg-white/45 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] hover:-translate-y-0.5 hover:bg-white/65 hover:border-[#1C1A16]/25 focus-visible:ring-[#231F17]/30",
};

export function buttonClass(
  variant: ButtonVariant = "ink",
  size: ButtonSize = "md",
  extra = "",
) {
  return [BUTTON_BASE, BUTTON_SIZES[size], BUTTON_VARIANTS[variant], extra]
    .filter(Boolean)
    .join(" ");
}

/** A soft status pill: tinted background, colored dot + label. */
export function StatusPill({
  status,
  className = "",
}: {
  status: string;
  className?: string;
}) {
  const s = statusMeta(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full py-1 pl-2 pr-2.5 ${className}`}
      style={{
        background: s.bg,
        boxShadow: `inset 0 0 0 1px ${s.fg}1F`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: s.fg }}
      />
      <span className="text-[11px] font-semibold" style={{ color: s.fg }}>
        {s.label}
      </span>
    </span>
  );
}

/** A gradient initials avatar. */
export function Avatar({
  name,
  size = 44,
  fontSize,
  className = "",
}: {
  name: string;
  size?: number;
  fontSize?: number;
  className?: string;
}) {
  return (
    <span
      className={`flex flex-none items-center justify-center rounded-full font-semibold text-[#F4F0E6] ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: fontSize ?? Math.round(size * 0.32),
        background: avatarGradient(name),
      }}
    >
      {initials(name)}
    </span>
  );
}
