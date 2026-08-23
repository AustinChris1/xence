import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/site/Nav";
import { DOC_PAGES, readDoc } from "@/lib/docs";
import { renderMarkdown } from "@/lib/markdown";
import { cn } from "@/lib/cn";

export const dynamic = "force-static";

export function generateStaticParams() {
  return DOC_PAGES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = DOC_PAGES.find((d) => d.slug === slug);
  return { title: page ? `${page.title} · Xence docs` : "Xence docs" };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const md = readDoc(slug);
  if (!md) notFound();

  return (
    <>
      <Nav />
      <main className="flex-1 pt-28 pb-24">
        <div className="mx-auto grid w-full max-w-5xl gap-10 px-5 sm:px-8 lg:grid-cols-[200px_minmax(0,1fr)]">
          <aside>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-faint)]">
              Docs
            </p>
            <nav className="flex gap-1.5 overflow-x-auto pb-1 lg:sticky lg:top-24 lg:flex-col lg:overflow-visible">
              {DOC_PAGES.map((d) => (
                <Link
                  key={d.slug}
                  href={`/docs/${d.slug}`}
                  title={d.blurb}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-[13px] transition-colors lg:rounded-xl",
                    d.slug === slug
                      ? "bg-teal-700 text-cream-100"
                      : "border border-[var(--edge)] text-[var(--text-dim)] hover:bg-cream-100 lg:border-transparent",
                  )}
                >
                  {d.title}
                </Link>
              ))}
            </nav>
          </aside>

          <article
            className="doc-prose min-w-0"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(md!) }}
          />
        </div>
      </main>
    </>
  );
}
