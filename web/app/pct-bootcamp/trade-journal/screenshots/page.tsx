"use client";

import { useState, useEffect } from "react";
import ScreenshotReview from "@/components/trade-journal/ScreenshotReview";

interface SheetTab {
  name: string;
  gid: number;
}

export default function ScreenshotsPage() {
  const [tabs, setTabs] = useState<SheetTab[] | null>(null);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTabs() {
      try {
        const res = await fetch("/api/trade-journal/tabs");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load tabs.");
        setTabs(data.tabs);
        // Auto-select first tab
        if (data.tabs.length > 0) {
          setSelectedTab(data.tabs[0].name);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    loadTabs();
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Screenshot Review</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
            Review your entry and end-of-day screenshots alongside trade data. Tag patterns for later analysis.
          </p>
        </div>
        <a
          href="/pct-bootcamp/trade-journal"
          className="shrink-0 rounded border px-3 py-2 text-sm font-medium transition-opacity hover:opacity-80"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          &laquo; Trade Journal
        </a>
      </div>

      {loading && (
        <div className="py-8 text-center text-sm" style={{ color: "var(--color-muted)" }}>
          Loading...
        </div>
      )}

      {error && (
        <div
          className="rounded border px-4 py-3 text-sm"
          style={{ borderColor: "var(--color-danger)", color: "var(--color-danger)" }}
        >
          {error}
        </div>
      )}

      {tabs && tabs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.gid}
              onClick={() => setSelectedTab(tab.name)}
              className="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
              style={{
                borderColor: selectedTab === tab.name ? "var(--color-accent)" : "var(--color-border)",
                backgroundColor: selectedTab === tab.name ? "var(--color-accent)" : "transparent",
                color: selectedTab === tab.name ? "var(--color-bg)" : "var(--color-text)",
              }}
            >
              {tab.name}
            </button>
          ))}
        </div>
      )}

      {selectedTab && <ScreenshotReview tabName={selectedTab} />}
    </div>
  );
}
