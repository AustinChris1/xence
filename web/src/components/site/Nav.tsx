"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
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
  onDark = false,
}: {
  right?: React.ReactNode;
  /** Sits over a dark ground until scrolled, so invert until the bar solidifies. */
  onDark?: boolean;
} = {}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // How far down the page you are, smoothed so it glides rather than jumps.
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

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
        <motion.div
          aria-hidden
          style={{ scaleX: progress }}
          className={cn(
            "absolute inset-x-0 bottom-0 h-px origin-left bg-teal-600 transition-opacity duration-500",
            scrolled ? "opacity-100" : "opacity-0",
          )}
        />
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="group" aria-label="Xence home">
            <XenceLogo
              size={26}
              accent="var(--color-teal-700)"
              alive
              className={cn(
                "transition-opacity group-hover:opacity-80",
                onDark && !scrolled ? "text-cream-100" : "text-teal-900",
              )}
            />
          </Link>

            <nav className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "group relative py-1 text-[13px] tracking-wide transition-all duration-200",
                  onDark && !scrolled
                    ? "text-cream-100/75 hover:text-cream-50"
                    : "text-[var(--text-dim)] hover:text-teal-700",
                )}
              >
                <span className="relative z-10">{l.label}</span>
                <span className="absolute inset-x-0 -bottom-0.5 h-[1.5px] origin-left scale-x-0 bg-teal-600 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {right ?? (
              <Link
                href="/app"
                className="btn-spring group hidden items-center gap-1.5 rounded-full bg-teal-700 px-4 py-2 text-[13px] font-medium text-cream-100 shadow-[var(--shadow-card)] transition-all hover:bg-teal-600 hover:shadow-[var(--shadow-deep)] sm:inline-flex"
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
              className="btn-spring rounded-full border border-[var(--edge-strong)] p-2 text-teal-800 transition-colors hover:bg-cream-100/50 md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </motion.header>

      {open ? (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-40 bg-cream-200/95 pt-24 md:hidden"
        >
          <nav className="flex flex-col gap-1 px-6">
            {LINKS.map((l, i) => (
              <motion.div
                key={l.href}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * (i + 1), ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between border-b border-[var(--edge)] py-4 font-display text-2xl text-teal-900 transition-colors hover:text-teal-700"
                >
                  <span>{l.label}</span>
                  <ArrowUpRight size={18} className="opacity-40" />
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href="/app"
                onClick={() => setOpen(false)}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal-700 px-5 py-3.5 font-medium text-cream-100 shadow-[var(--shadow-card)] transition-all hover:bg-teal-600"
              >
                Seal a forecast <ArrowUpRight size={16} />
              </Link>
            </motion.div>
          </nav>
        </motion.div>
      ) : null}
    </>
  );
}
