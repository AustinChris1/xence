/**
 * THE XENCE MARK
 *
 * One sentence of meaning (required by the brand rule, and it must survive
 * being read aloud to a stranger):
 *
 *   Xence's mark is the probability square's two diagonals — the solid line of
 *   verified truth and the broken line of a still-sealed forecast — crossing at
 *   the point of maximum uncertainty, where the seal sits.
 *
 * Why each element is there:
 *
 *   · The FRAME is the unit square of a calibration plot: predicted probability
 *     on one axis, observed frequency on the other. Every forecaster's whole
 *     life happens inside this box.
 *   · The SOLID diagonal is the 45° line of perfect calibration — the truth
 *     line. It is unbroken because the outcome, once resolved, is not
 *     negotiable.
 *   · The BROKEN diagonal is the forecast while it is still sealed. It is drawn
 *     as two segments that stop short of the centre: a sealed call has not yet
 *     touched the truth. On reveal, it would close.
 *   · The SEAL at the intersection sits at (0.5, 0.5) — the coordinate of
 *     maximum uncertainty, the least useful forecast anyone can make, and
 *     therefore exactly the thing this protocol exists to price.
 *
 * Together the two diagonals read as the X of Xence — from *prescience*,
 * knowing before it happens.
 *
 * Constraints it satisfies: pure geometry (no raster, no font dependence),
 * legible at 16px, monochrome-safe (solid vs. broken vs. dot survives a single
 * colour), and correct on both light and dark grounds because every value is
 * currentColor or the passed accent.
 */

type XenceMarkProps = {
  size?: number;
  /** Draw the calibration-square frame. Off gives the bare crossing. */
  frame?: boolean;
  /** Colour of the seal + truth line. Defaults to inheriting currentColor. */
  accent?: string;
  className?: string;
  /** Animate the seal's slow breath. Off for favicons and dense UI. */
  alive?: boolean;
  title?: string;
};

export function XenceMark({
  size = 32,
  frame = true,
  accent,
  className,
  alive = false,
  title,
}: XenceMarkProps) {
  const accentColor = accent ?? "currentColor";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}

      {/* The probability square. */}
      {frame ? (
        <rect
          x="2.25"
          y="2.25"
          width="27.5"
          height="27.5"
          rx="8.5"
          stroke="currentColor"
          strokeOpacity="0.34"
          strokeWidth="1.5"
        />
      ) : null}

      {/* The sealed forecast: broken, stopping short of the truth line. */}
      <path
        d="M8.4 8.4 L12.5 12.5"
        stroke="currentColor"
        strokeOpacity="0.62"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        d="M19.5 19.5 L23.6 23.6"
        stroke="currentColor"
        strokeOpacity="0.62"
        strokeWidth="2.1"
        strokeLinecap="round"
      />

      {/* The truth line: 45°, unbroken, the calibration diagonal. */}
      <path
        d="M8.4 23.6 L23.6 8.4"
        stroke={accentColor}
        strokeWidth="2.1"
        strokeLinecap="round"
      />

      {/* The seal, at p = 0.5. Maximum uncertainty, held shut. */}
      <circle
        cx="16"
        cy="16"
        r="3.05"
        fill={accentColor}
        className={alive ? "animate-[pulse-seal_3.2s_ease-in-out_infinite] [transform-origin:16px_16px]" : undefined}
      />
      {/* Negative notch keeps the seal reading as a seal, not a blob, at 16px. */}
      <circle cx="16" cy="16" r="1.05" fill="var(--surface)" fillOpacity="0.92" />
    </svg>
  );
}

/**
 * Mark + wordmark. The wordmark is Instrument Serif — an editorial face, chosen
 * because a track record is a document, not an app screen.
 */
export function XenceLogo({
  size = 30,
  className,
  accent,
  alive = false,
}: {
  size?: number;
  className?: string;
  accent?: string;
  alive?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <XenceMark size={size} accent={accent} alive={alive} title="Xence" />
      <span
        className="font-display leading-none tracking-[-0.015em]"
        style={{ fontSize: size * 0.92 }}
      >
        Xence
      </span>
    </span>
  );
}
