export default function CardsPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Flashcards</h1>
      <p className="text-sm" style={{ color: "var(--color-muted)" }}>
        Spaced-repetition review (FSRS) with manual and AI-generated cards lands in P1.
        The data model, FSRS engine, and review API are specified in{" "}
        <code>docs/usmle-prep-app/master-plan.md</code> §8.
      </p>
    </div>
  );
}
