"use client";

import { useState } from "react";
import ReviewSession from "@/components/usmle/ReviewSession";
import CardComposer from "@/components/usmle/CardComposer";
import CardBrowser from "@/components/usmle/CardBrowser";

export default function CardsPage() {
  const [tab, setTab] = useState<"review" | "browse" | "build">("review");
  // Bumping this key remounts the review session so newly-added cards show up.
  const [reviewKey, setReviewKey] = useState(0);

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Flashcards</h1>
        <div className="flex gap-1 rounded-md border p-0.5" style={{ borderColor: "var(--color-border)" }}>
          {(["review", "browse", "build"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="rounded px-3 py-1 text-sm capitalize"
              style={tab === t
                ? { backgroundColor: "var(--color-accent)", color: "var(--color-bg)" }
                : { color: "var(--color-muted)" }}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      {tab === "review" ? (
        <ReviewSession key={reviewKey} />
      ) : tab === "browse" ? (
        <CardBrowser />
      ) : (
        <CardComposer onChange={() => setReviewKey((k) => k + 1)} />
      )}
    </div>
  );
}
