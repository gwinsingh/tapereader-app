"use client";

import StudyNotes from "@/components/usmle/StudyNotes";

export default function NotesPage() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">Study Notes</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
          First-Aid–aligned theory &amp; revision summaries — generate with AI or write your own.
        </p>
      </header>
      <StudyNotes />
    </div>
  );
}
