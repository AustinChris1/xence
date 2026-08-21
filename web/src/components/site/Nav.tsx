"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { XenceLogo } from "@/components/brand/XenceMark";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/#mechanism", label: "How it works" },
  { href: "/#forfeit", label: "The forfeit rule" },
  { href: "/#privacy", label: "What stays private" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "glass border-b border-[var(--edge)] py-3"
            : "border-b border-transparent py-5",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="group" aria-label="Xence home">
            <XenceLogo
              size={26}
              accent="var(--color-cream-200)"
              alive
              className="text-cream-100 transition-opacity group-hover:opacity-80"
            />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[13px] tracking-wide text-[var(--text-dim)] transition-colors hover:text-cream-100"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="group hidden items-center gap-1.5 rounded-full bg-cream-200 px-4 py-2 text-[13px] font-medium text-ink-900 transition-all hover:bg-cream-100 sm:inline-flex"
            >
              Seal a forecast
              <ArrowUpRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="rounded-full border border-[var(--edge-strong)] p-2 text-cream-100 md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </motion.header>

      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-40 bg-ink-950/95 pt-24 backdrop-blur-xl md:hidden"
        >
          <nav className="flex flex-col gap-1 px-6">
            {LINKS.map((l, i) => (
              <motion.div
                key={l.href}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-[var(--edge)] py-4 font-display text-2xl text-cream-100"
                >
                  {l.label}
                </Link>
              </motion.div>
            ))}
            <Link
              href="/app"
              onClick={() => setOpen(false)}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-cream-200 px-5 py-3 font-medium text-ink-900"
            >
              Seal a forecast <ArrowUpRight size={16} />
            </Link>
          </nav>
        </motion.div>
      ) : null}
    </>
  );
}
