"use client";

import { motion, useReducedMotion } from "motion/react";
import type { CalibrationBin } from "@/lib/scoring";

/**
 * THE CALIBRATION PLOT
 *
 * The one chart that explains the entire product, and the same geometry as the
 * logo: claimed probability on x, observed frequency on y, and the 45° line
 * where an honest forecaster's points land.
 *
 * A point ABOVE the line means the forecaster was too pessimistic — things
 * happened more often than they said. BELOW means overconfident bluster, which
 * is the failure mode the internet's alpha economy runs on.
 */

type Props = {
  bins: CalibrationBin[];
  size?: number;
  /** Show the sealed marker at p = 0.5, the coordinate of the logo's seal. */
  showSeal?: boolean;
  className?: string;
  animate?: boolean;
};

export function CalibrationPlot({
  bins,
  size = 420,
  showSeal = false,
  className,
  animate = true,
}: Props) {
  const reduced = useReducedMotion();
  const shouldAnimate = animate && !reduced;

  const pad = 44;
  const inner = size - pad * 2;
  const x = (v: number) => pad + v * inner;
  const y = (v: number) => pad + (1 - v) * inner;

  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const populated = bins.filter((b) => b.count > 0);

  const path = populated
    .map((b, i) => `${i === 0 ? "M" : "L"} ${x(b.claimed)} ${y(b.observed)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role="img"
      aria-label="Calibration plot: stated probability against observed frequency"
    >
      <defs>
        <linearGradient id="xence-plot-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-teal-400)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--color-teal-400)" stopOpacity="0" />
        </linearGradient>
        <filter id="xence-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Plot field */}
      <rect
        x={pad}
        y={pad}
        width={inner}
        height={inner}
        rx="10"
        fill="var(--color-ink-950)"
        fillOpacity="0.45"
        stroke="currentColor"
        strokeOpacity="0.16"
      />

      {/* Grid */}
      {ticks.map((t) => (
        <g key={`grid-${t}`} stroke="currentColor" strokeOpacity="0.09">
          <line x1={x(t)} y1={pad} x2={x(t)} y2={pad + inner} />
          <line x1={pad} y1={y(t)} x2={pad + inner} y2={y(t)} />
        </g>
      ))}

      {/* Axis labels */}
      {ticks.map((t) => (
        <g key={`lab-${t}`} className="font-mono" fill="currentColor" fillOpacity="0.45">
          <text x={x(t)} y={pad + inner + 20} fontSize="10" textAnchor="middle">
            {Math.round(t * 100)}
          </text>
          <text x={pad - 12} y={y(t) + 3.5} fontSize="10" textAnchor="end">
            {Math.round(t * 100)}
          </text>
        </g>
      ))}
      <text
        x={pad + inner / 2}
        y={size - 6}
        fontSize="10.5"
        textAnchor="middle"
        fill="currentColor"
        fillOpacity="0.55"
        className="font-mono uppercase tracking-[0.18em]"
      >
        claimed
      </text>
      <text
        x={13}
        y={pad + inner / 2}
        fontSize="10.5"
        textAnchor="middle"
        fill="currentColor"
        fillOpacity="0.55"
        transform={`rotate(-90 13 ${pad + inner / 2})`}
        className="font-mono uppercase tracking-[0.18em]"
      >
        observed
      </text>

      {/* The truth line — solid, unbroken, exactly as in the mark. */}
      <motion.line
        x1={x(0)}
        y1={y(0)}
        x2={x(1)}
        y2={y(1)}
        stroke="var(--color-cream-200)"
        strokeOpacity="0.55"
        strokeWidth="1.75"
        strokeLinecap="round"
        initial={shouldAnimate ? { pathLength: 0 } : false}
        whileInView={shouldAnimate ? { pathLength: 1 } : undefined}
        viewport={{ once: true }}
        transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* The forecaster's actual curve */}
      {populated.length > 1 ? (
        <>
          <motion.path
            d={`${path} L ${x(populated[populated.length - 1].claimed)} ${y(0)} L ${x(populated[0].claimed)} ${y(0)} Z`}
            fill="url(#xence-plot-fill)"
            initial={shouldAnimate ? { opacity: 0 } : false}
            whileInView={shouldAnimate ? { opacity: 1 } : undefined}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.7 }}
          />
          <motion.path
            d={path}
            fill="none"
            stroke="var(--color-teal-300)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#xence-glow)"
            initial={shouldAnimate ? { pathLength: 0 } : false}
            whileInView={shouldAnimate ? { pathLength: 1 } : undefined}
            viewport={{ once: true }}
            transition={{ duration: 1.4, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          />
        </>
      ) : null}

      {/* Bins — radius carries sample size, so a lucky single call looks small */}
      {populated.map((b, i) => (
        <motion.g
          key={`bin-${i}`}
          initial={shouldAnimate ? { opacity: 0, scale: 0.4 } : false}
          whileInView={shouldAnimate ? { opacity: 1, scale: 1 } : undefined}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.8 + i * 0.09 }}
          style={{ transformOrigin: `${x(b.claimed)}px ${y(b.observed)}px` }}
        >
          <circle
            cx={x(b.claimed)}
            cy={y(b.observed)}
            r={5 + Math.min(7, Math.log2(b.count + 1) * 2.4)}
            fill="var(--color-teal-400)"
            fillOpacity="0.16"
          />
          <circle
            cx={x(b.claimed)}
            cy={y(b.observed)}
            r="4"
            fill="var(--color-cream-100)"
          />
        </motion.g>
      ))}

      {/* The seal, at the coordinate of maximum uncertainty. */}
      {showSeal ? (
        <g>
          <circle
            cx={x(0.5)}
            cy={y(0.5)}
            r="7"
            fill="var(--color-cream-200)"
            className="animate-[pulse-seal_3.2s_ease-in-out_infinite]"
            style={{ transformOrigin: `${x(0.5)}px ${y(0.5)}px` }}
          />
          <circle cx={x(0.5)} cy={y(0.5)} r="2.4" fill="var(--color-ink-900)" />
        </g>
      ) : null}
    </svg>
  );
}
