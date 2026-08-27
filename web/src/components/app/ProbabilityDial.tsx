"use client";

import { motion, useReducedMotion } from "motion/react";
import { describeConfidence } from "@/lib/scoring";
import { cn } from "@/lib/cn";

/** The probability dial. */

const R = 88;
const CIRC = Math.PI * R; // semicircle

export function ProbabilityDial({
  value,
  onChange,
  disabled,
}: {
  /** Probability in basis points, 100..9900 */
  value: number;
  onChange: (bp: number) => void;
  disabled?: boolean;
}) {
  const reduced = useReducedMotion();
  const pct = value / 100; // 1..99
  const frac = pct / 100;

  // Semicircle from 180° (left) to 0° (right).
  const angle = Math.PI * (1 - frac);
  const handleX = 110 + R * Math.cos(angle);
  const handleY = 110 - R * Math.sin(angle);

  const tone =
    pct >= 60 ? "var(--color-teal-600)" : pct <= 40 ? "var(--color-seal-500)" : "var(--color-cream-500)";

  return (
    <div className="relative select-none">
      <svg viewBox="0 0 220 132" className="w-full" role="presentation">
        <defs>
          <linearGradient id="dial-track" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-seal-500)" stopOpacity="0.45" />
            <stop offset="50%" stopColor="var(--color-cream-500)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-teal-600)" stopOpacity="0.45" />
          </linearGradient>
        </defs>

        {/* Track */}
        <path
          d={`M ${110 - R} 110 A ${R} ${R} 0 0 1 ${110 + R} 110`}
          fill="none"
          stroke="url(#dial-track)"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Ticks at each decile, the reference points people think in */}
        {Array.from({ length: 11 }, (_, i) => i / 10).map((t) => {
          const a = Math.PI * (1 - t);
          const inner = R - 11;
          const outer = R - 6;
          return (
            <line
              key={t}
              x1={110 + inner * Math.cos(a)}
              y1={110 - inner * Math.sin(a)}
              x2={110 + outer * Math.cos(a)}
              y2={110 - outer * Math.sin(a)}
              stroke="currentColor"
              strokeOpacity={t === 0.5 ? 0.55 : 0.2}
              strokeWidth={t === 0.5 ? 1.6 : 1}
            />
          );
        })}

        {/* Filled arc */}
        <motion.path
          d={`M ${110 - R} 110 A ${R} ${R} 0 0 1 ${110 + R} 110`}
          fill="none"
          stroke={tone}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          animate={{ strokeDashoffset: CIRC * (1 - frac) }}
          initial={false}
          transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 190, damping: 26 }}
        />

        {/* Handle */}
        <motion.g
          animate={{ x: handleX, y: handleY }}
          initial={false}
          transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 220, damping: 24 }}
        >
          <circle r="14" fill={tone} fillOpacity="0.18" className="animate-pulse" />
          <circle r="10.5" fill="var(--color-cream-50)" stroke={tone} strokeWidth="2.5" />
          <circle r="3.5" fill={tone} />
        </motion.g>

        {/* Readout */}
        <text
          x="110"
          y="93"
          textAnchor="middle"
          className="font-display tnum select-none"
          fontSize="44"
          fill="var(--color-teal-950)"
          fontWeight="600"
        >
          {pct}%
        </text>
        <text
          x="110"
          y="116"
          textAnchor="middle"
          className="font-mono uppercase select-none"
          fontSize="9"
          letterSpacing="0.18em"
          fill="currentColor"
          fillOpacity="0.55"
        >
          {describeConfidence(frac)}
        </text>
      </svg>

      {/* The real control. */}
      <input
        type="range"
        min={100}
        max={9900}
        step={100}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Probability"
        aria-valuetext={`${pct} percent`}
        className="mt-1 w-full cursor-pointer appearance-none bg-transparent
          [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[var(--edge-strong)]
          [&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:h-4.5 [&::-webkit-slider-thumb]:w-4.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-700 [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(3,83,82,0.4)]
          [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[var(--edge-strong)]
          [&::-moz-range-thumb]:h-4.5 [&::-moz-range-thumb]:w-4.5 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-teal-700"
      />

      {/* Quick probability presets for fast, delightful touch & click */}
      <div className="mt-3 flex justify-between gap-1">
        {[1000, 2500, 5000, 7500, 9000].map((preset) => {
          const active = value === preset;
          return (
            <button
              key={preset}
              type="button"
              disabled={disabled}
              onClick={() => onChange(preset)}
              className={cn(
                "btn-spring rounded-lg px-2 py-1 font-mono text-[10.5px] transition-all",
                active
                  ? "bg-teal-700 text-cream-100 shadow-[0_1px_4px_rgba(3,83,82,0.3)]"
                  : "border border-[var(--edge)] bg-cream-50 text-[var(--text-faint)] hover:border-[var(--edge-strong)] hover:text-teal-900",
              )}
            >
              {preset / 100}%
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex justify-between font-mono text-[9.5px] text-[var(--text-faint)]">
        <span>1% · certain it won&apos;t</span>
        <span>99% · certain it will</span>
      </div>
    </div>
  );
}
