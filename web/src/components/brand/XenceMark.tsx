/** The mark: the probability square's two diagonals, truth solid and forecast broken, crossing at the seal. */

type XenceMarkProps = {
  size?: number;
  /** Draw the calibration-square frame. */
  frame?: boolean;
  /** Colour of the seal + truth line. */
  accent?: string;
  className?: string;
  /** Animate the seal's slow breath. */
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

      {/* The seal, at p = 0.5. */}
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

/** Mark + wordmark. */
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
