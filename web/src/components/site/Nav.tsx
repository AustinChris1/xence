"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { XenceLogo } from "@/components/brand/XenceMark";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/#mechanism", label: "How it works" },
  { href: "/#forfeit", label: "The forfeit rule" },
  { href: "/#privacy", label: "What stays private" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/docs", label: "Docs" },
];

export function Nav({
  right,
  onDark,
}: {
  right?: React.ReactNode;
  onDark?: boolean;
} = {}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-[#05080f]/85 backdrop-blur-xl border-b border-white/10 py-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
            : "border-b border-transparent py-5 bg-transparent",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="group flex items-center gap-2.5" aria-label="Xence home">
            <XenceLogo
              size={28}
              accent="#2dd4bf"
              alive
              className="text-white transition-opacity group-hover:opacity-90"
            />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group relative py-1 text-[13.5px] font-medium tracking-wide text-slate-300 transition-all duration-200 hover:text-white"
              >
                <span>{l.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {right ?? (
              <Link
                href="/app"
                className="btn-spring group hidden items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-400 to-teal-500 px-4.5 py-2 text-[13px] font-bold text-slate-950 shadow-[0_0_20px_rgba(45,212,191,0.35)] transition-all hover:shadow-[0_0_30px_rgba(45,212,191,0.55)] sm:inline-flex"
              >
                Seal a forecast
                <ArrowUpRight
                  size={14}
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            )}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="btn-spring rounded-xl border border-white/10 bg-slate-900/60 p-2 text-slate-300 transition-colors hover:bg-slate-800 md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 bg-[#05080f]/95 pt-24 px-6 md:hidden">
          <nav className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-white/10 py-4 text-xl text-white transition-colors hover:text-teal-300"
              >
                <span>{l.label}</span>
                <ArrowUpRight size={18} className="opacity-40" />
              </Link>
            ))}
            <Link
              href="/app"
              onClick={() => setOpen(false)}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-teal-500 px-5 py-3.5 font-bold text-slate-950 shadow-[0_0_25px_rgba(45,212,191,0.4)]"
            >
              Seal a forecast <ArrowUpRight size={16} />
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
