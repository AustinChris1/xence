"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Info } from "lucide-react";

/** Explanation behind an (i) — click to open, Escape or outside-click to close. */
export function InfoTip({
  children,
  label = "More information",
  align = "right",
}: {
  children: React.ReactNode;
  label?: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[var(--text-faint)] transition-colors hover:text-teal-700"
      >
        <Info size={13} />
      </button>
      {open ? (
        <span
          id={id}
          role="tooltip"
          className={`absolute bottom-full z-50 mb-2 w-64 rounded-xl border border-[var(--edge-strong)] bg-cream-50 p-3 text-[12px] font-normal leading-relaxed text-[var(--text-dim)] shadow-[var(--shadow-deep)] ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {children}
        </span>
      ) : null}
    </span>
  );
}
