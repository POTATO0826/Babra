"use client";

import { useEffect } from "react";
import { Close } from "@/components/icons";

/**
 * A right-side slide-in panel with a scrim. Renders nothing when `open` is
 * false so the heavy panel content only mounts when needed.
 */
export function Drawer({
  open,
  onClose,
  label,
  width = 480,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  width?: number;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <div
        onClick={onClose}
        aria-hidden
        className="animate-scrim absolute inset-0 bg-[rgba(38,34,25,0.32)]"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="animate-panel absolute right-0 top-0 h-screen max-w-[92vw] overflow-y-auto border-l border-line bg-sidebar shadow-[-30px_0_60px_-30px_rgba(38,34,25,0.4)]"
        style={{ width }}
      >
        {children}
      </aside>
    </div>
  );
}

/** Close button used in drawer/modal headers. */
export function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close panel"
      className="flex h-8 w-8 flex-none items-center justify-center rounded-[9px] bg-[#EFE9DD] text-muted transition-colors hover:bg-[#E7E0D2]"
    >
      <Close className="h-4 w-4" />
    </button>
  );
}

/** A small uppercase section label used throughout drawers. */
export function DrawerLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-quiet">
      {children}
    </h4>
  );
}
