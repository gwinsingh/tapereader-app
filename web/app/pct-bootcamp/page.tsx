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
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
          Tools and utilities for PCT bootcamp participants.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-lg border p-5 transition-colors"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}
          >
            <h2 className="font-semibold" style={{ color: "var(--color-text)" }}>{tool.name}</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
