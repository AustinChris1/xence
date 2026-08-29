import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

const title = "Xence — Proof you were right, before it happened";
const description =
  "A private, stake-backed reputation layer for forecasts on Starknet. Seal forecasts into zero-knowledge vaults, bond STRK privately, and build an unforgeable track record.";

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
  themeColor: "#fafbfc",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fafbfc] text-slate-900">
        {children}
      </body>
    </html>
  );
}
