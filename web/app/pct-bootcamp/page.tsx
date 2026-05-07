import Link from "next/link";

const tools = [
  {
    name: "Auto Trade Journal",
    href: "/pct-bootcamp/trade-journal",
    description:
      "Upload DAS Trader CSV logs to automatically journal executed trades into a shared Google Sheet, grouped by account.",
  },
];

export default function PCTBootcampPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">PCT Bootcamp</h1>
        <p className="mt-1 text-sm text-muted">
          Tools and utilities for PCT bootcamp participants.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-lg border border-border bg-panel p-5 transition-colors hover:border-accent/40"
          >
            <h2 className="font-semibold group-hover:text-accent">{tool.name}</h2>
            <p className="mt-1 text-sm text-muted">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
