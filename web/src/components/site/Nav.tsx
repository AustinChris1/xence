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
  const solid = scrolled || onDark;

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
          solid
            ? "border-b border-cream-300 bg-[#faf9f5]/85 py-3.5 shadow-[0_10px_30px_rgba(16,32,29,0.10)] backdrop-blur-xl"
            : "border-b border-transparent bg-transparent py-5",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="group flex items-center gap-2.5" aria-label="Xence home">
            <XenceLogo
              size={28}
              accent="#2dd4bf"
              alive
              className="text-teal-950 transition-opacity group-hover:opacity-90"
            />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group relative py-1 text-[13.5px] font-medium tracking-wide text-cream-500 transition-all duration-200 hover:text-teal-950"
              >
                <span>{l.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {right ?? (
              <Link
                href="/app"
                className="btn-spring group hidden items-center gap-1.5 rounded-xl bg-teal-600 px-4.5 py-2 text-[13px] font-bold text-white shadow-[0_10px_24px_rgba(13,148,136,0.18)] transition-all hover:bg-teal-700 sm:inline-flex"
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
              className="btn-spring rounded-xl border border-cream-300 bg-white p-2 text-cream-500 transition-colors hover:bg-cream-200 md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 bg-[#faf9f5]/95 pt-24 px-6 md:hidden">
          <nav className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-cream-300 py-4 text-xl text-teal-950 transition-colors hover:text-teal-700"
              >
                <span>{l.label}</span>
                <ArrowUpRight size={18} className="opacity-40" />
              </Link>
            ))}
            <Link
              href="/app"
              onClick={() => setOpen(false)}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3.5 font-bold text-white shadow-[0_10px_24px_rgba(13,148,136,0.18)]"
            >
              Seal a forecast <ArrowUpRight size={16} />
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
