import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/**
 * The brand face. A track record is a document, so the display type is
 * editorial rather than product-UI — and deliberately not the sans everything
 * else on the internet uses.
 */
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const title = "Xence — proof you were right, before it happened";
const description =
  "A private, stake-backed reputation layer for forecasts. Seal a call before the outcome exists, bond it through the STRK20 privacy pool, and let the chain score your calibration. Your record is public. Your position is not.";

export const metadata: Metadata = {
  metadataBase: new URL("https://xence.xyz"),
  title: { default: title, template: "%s · Xence" },
  description,
  applicationName: "Xence",
  keywords: [
    "forecasting",
    "calibration",
    "Brier score",
    "Starknet",
    "STRK20",
    "privacy",
    "reputation",
    "zero-knowledge",
  ],
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "Xence",
  },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#02100f",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // Wallet extensions write their own attributes onto <html> before React
    // hydrates — Bybit stamps data-bybit-* on this page, and every wallet does
    // some version of it. That is a mismatch React cannot reconcile and has no
    // way to prevent, and this app expects users to arrive with several wallets
    // installed. Suppression is scoped to attributes on this element only; it
    // does not hide genuine mismatches in the tree below.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
