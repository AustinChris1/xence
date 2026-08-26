/** Crisp vector logos for Starknet, STRK, Pragma, and ecosystem integrations. */

export function StarknetLogo({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Starknet"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M50 0C22.386 0 0 22.386 0 50s22.386 50 50 50 50-22.386 50-50S77.614 0 50 0Zm0 8.333c23.012 0 41.667 18.655 41.667 41.667S73.012 91.667 50 91.667 8.333 73.012 8.333 50 26.988 8.333 50 8.333Zm-15.625 25v33.334l12.5-16.667-12.5-16.667Zm31.25 0-12.5 16.667 12.5 16.667V33.333Z"
      />
      <circle cx="50" cy="50" r="7.5" />
    </svg>
  );
}

export function StrkLogo({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="STRK"
    >
      <circle cx="16" cy="16" r="15" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M16 6L24 11V21L16 26L8 21V11L16 6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="3.2" fill="currentColor" />
    </svg>
  );
}

export function PragmaLogo({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Pragma Oracle"
    >
      <circle cx="16" cy="16" r="14.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
      <path
        d="M11 21L16 9L21 21L16 17.5L11 21Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function EthLogo({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Ethereum"
    >
      <path d="M16 3L7 16.5L16 21.5L25 16.5L16 3Z" fillOpacity="0.7" />
      <path d="M16 23L7 18L16 29L25 18L16 23Z" />
    </svg>
  );
}

export function BtcLogo({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Bitcoin"
    >
      <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M18.8 14.2c.6-.4.9-1 .9-1.8 0-1.6-1.3-2.4-3.2-2.4H12v12h4.8c2.1 0 3.5-.9 3.5-2.7 0-1.1-.5-2-1.5-2.4v-.1c.7-.4 1.2-1.2 1.2-2.1v-.5zm-4.7-2.4h2c1.1 0 1.9.4 1.9 1.4s-.8 1.4-1.9 1.4h-2v-2.8zm2.4 8H14.1v-3.1h2.4c1.2 0 2.1.4 2.1 1.5 0 1.2-.9 1.6-2.1 1.6z"
      />
    </svg>
  );
}

export function CairoLogo({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Cairo"
    >
      <rect x="4" y="4" width="24" height="24" rx="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 21L16 11L22 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 17.5H19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
