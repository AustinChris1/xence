"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  // Portaled to <body> so no card, sibling or overflow can paint over it.
  const [pos, setPos] = useState<{ top: number; left?: number; right?: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const id = useId();

  function toggle() {
    if (pos) return setPos(null);
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    setPos(
      align === "right"
        ? { top: r.top - 8, right: window.innerWidth - r.right }
        : { top: r.top - 8, left: r.left },
    );
  }

  useEffect(() => {
    if (!pos) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !tipRef.current?.contains(t)) setPos(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPos(null);
    const onMove = () => setPos(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [pos]);

  return (
    <span className="relative inline-flex">
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-expanded={pos !== null}
        aria-controls={id}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[var(--text-faint)] transition-colors hover:text-teal-700"
      >
        <Info size={13} />
      </button>
      {pos
        ? createPortal(
            <span
              ref={tipRef}
              id={id}
              role="tooltip"
              style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                right: pos.right,
                transform: "translateY(-100%)",
                maxWidth: "calc(100vw - 24px)",
              }}
              className="z-[80] w-64 rounded-xl border border-[var(--edge-strong)] bg-cream-50 p-3 text-[12px] font-normal leading-relaxed text-[var(--text-dim)] shadow-[var(--shadow-deep)]"
            >
              {children}
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
