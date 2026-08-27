/** The /docs pages are compiled from the repo's /docs markdown at build time. */

import fs from "node:fs";
import path from "node:path";

export const DOC_PAGES = [
  { slug: "overview", title: "Overview", blurb: "What Xence is and why it needs a shielded pool." },
  { slug: "how-it-works", title: "How it works", blurb: "The sealed envelope, the bond and the referee, in plain terms." },
  { slug: "usage", title: "Using the dapp", blurb: "A tester's walkthrough of every control and what it costs." },
] as const;

export type DocSlug = (typeof DOC_PAGES)[number]["slug"];

export function readDoc(slug: string): string | null {
  if (!DOC_PAGES.some((d) => d.slug === slug)) return null;
  // Local dev builds from web/, the repo root fallback covers other layouts.
  for (const dir of [path.join(process.cwd(), "..", "docs"), path.join(process.cwd(), "docs")]) {
    const file = path.join(dir, `${slug}.md`);
    if (fs.existsSync(file)) return fs.readFileSync(file, "utf8");
  }
  return null;
}
