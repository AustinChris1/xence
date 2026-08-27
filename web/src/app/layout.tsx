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

const title = "Xence — Make the call now. Prove it later.";
const description =
  "A private, stake-backed reputation layer for forecasts on Starknet. Lock in predictions before outcomes exist, reveal them later, and build a track record that cannot be rewritten.";

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
  themeColor: "#faf9f5",
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
      <body className="min-h-full flex flex-col bg-cream-100 text-teal-950">
        {children}
      </body>
    </html>
  );
}
