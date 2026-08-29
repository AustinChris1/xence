"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { XenceLogo } from "@/components/brand/XenceMark";

const LINKS = [
  { href: "/#problem", label: "Problem" },
  { href: "/#mechanism", label: "Architecture" },
  { href: "/#privacy", label: "Privacy Matrix" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/docs", label: "Docs" },
];

export function Nav({ right }: { right?: React.ReactNode; onDark?: boolean } = {}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-200 ${
          scrolled
            ? "bg-[#fafbfc]/90 backdrop-blur-md border-b border-slate-200/90 shadow-2xs py-3.5"
            : "bg-transparent border-b border-transparent py-4.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5" aria-label="Xence Home">
            <XenceLogo size={26} accent="#9a5b09" alive className="text-slate-900" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[13.5px] font-medium text-slate-600 hover:text-slate-950 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/AustinChris1/xence"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub Repository"
              className="hidden sm:inline-flex items-center justify-center w-8.5 h-8.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>

            {right ?? (
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-semibold shadow-xs hover:shadow-md transition-all"
              >
                <span>Launch App</span>
                <ArrowUpRight size={13} className="text-slate-300" />
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="p-2 text-slate-700 hover:text-slate-950 md:hidden rounded-lg bg-white border border-slate-200"
              aria-label="Toggle menu"
            >
              {open ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 z-40 bg-[#fafbfc]/98 pt-24 px-6 md:hidden">
          <nav className="flex flex-col gap-2">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between py-3.5 border-b border-slate-200 text-lg font-medium text-slate-900"
              >
                <span>{l.label}</span>
                <ArrowUpRight size={18} className="text-slate-400" />
              </Link>
            ))}
            <Link
              href="/app"
              onClick={() => setOpen(false)}
              className="mt-6 flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-slate-900 text-white font-semibold shadow-md"
            >
              <span>Launch App</span>
              <ArrowUpRight size={16} />
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
