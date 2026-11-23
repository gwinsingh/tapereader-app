import latest from "@/lib/blog-latest.json";

type Note = { title: string; slug: string; date: string; dateText: string; summary: string; tags: string[] };

// The research blog lives at /blog as static pages (built by scripts/blog/build.js, which also writes
// lib/blog-latest.json). This block puts it at the top of the home page while the scanner is being rebuilt.
export default function BlogSection() {
  const notes = (latest.posts as Note[]).slice(0, 4);
  return (
    <section className="rounded border border-accent/30 bg-panel p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-text">Research blog</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Dated research notes: how market drops unfold, how well-known investors actually work, and what holds up
            in the data. {latest.count} notes so far.
          </p>
        </div>
        <a
          href="/blog"
          className="rounded bg-accent px-3 py-1.5 text-sm font-semibold text-bg hover:opacity-90"
        >
          Open the blog →
        </a>
      </div>
      <ul className="divide-y divide-border">
        {notes.map((n) => (
          <li key={n.slug} className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-4">
            <span className="w-28 shrink-0 font-mono text-xs text-muted sm:pt-1">{n.dateText}</span>
            <div>
              <a href={`/blog/${n.slug}`} className="font-medium text-text hover:text-accent">
                {n.title}
              </a>
              <p className="mt-0.5 text-sm text-muted">{n.summary}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
