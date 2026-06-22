// Claude card generation via the Messages API (raw fetch — edge-safe, no SDK,
// matching this repo's Web-Crypto/fetch convention). Returns draft cards for a
// human approval queue; nothing is auto-added to a deck.
// See docs/usmle-prep-app/master-plan.md §8.3.

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
// Default to the latest capable model; override via env to tune cost later.
const MODEL = process.env.USMLE_AI_MODEL || "claude-opus-4-8";

export interface DraftCard {
  front: string;
  back: string;
  type: "basic" | "cloze";
  extra?: string;
  tags: string[];
}

export interface GenerateInput {
  topicName?: string; // e.g. "Cardiovascular → Heart Failure"
  disciplines?: string[]; // e.g. ["pathology","physiology"]
  notes?: string; // pasted lecture/notes text to card
  missedConcept?: string; // a missed UWorld concept to build mechanism cards around
  count?: number; // desired number of cards (default 12)
}

const SYSTEM = `You are an expert USMLE Step 1 tutor creating spaced-repetition flashcards.
Rules:
- Step 1 is mechanism-first: prefer cards that test the "why"/causal reasoning behind a fact, not rote definitions.
- One discrete fact or mechanism per card. Keep fronts as focused questions; keep backs concise.
- Use NBME vignette-style framing where natural, but cards should be quick to review.
- Where a memory hook helps, put a brief mnemonic in "extra". Otherwise omit it.
- "type" is "basic" (front question / back answer). Do not produce cloze cards unless the source text is clearly cloze-friendly.
- Tag each card with the relevant discipline(s) (pathology, physiology, pharmacology, biochemistry, microbiology, immunology, anatomy, behavioral_science, biostatistics, genetics).
- Be medically accurate. If unsure, omit the card rather than guess.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    cards: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          front: { type: "string" },
          back: { type: "string" },
          type: { type: "string", enum: ["basic", "cloze"] },
          extra: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
        },
        required: ["front", "back", "type", "tags"],
      },
    },
  },
  required: ["cards"],
} as const;

function buildPrompt(input: GenerateInput): string {
  const n = input.count ?? 12;
  const parts: string[] = [`Generate ${n} high-yield USMLE Step 1 flashcards.`];
  if (input.topicName) parts.push(`Topic: ${input.topicName}.`);
  if (input.disciplines?.length) parts.push(`Emphasize disciplines: ${input.disciplines.join(", ")}.`);
  if (input.missedConcept)
    parts.push(`The student missed a question about: "${input.missedConcept}". Build cards that cover the underlying mechanism and the common distractors/related concepts.`);
  if (input.notes) parts.push(`Base the cards on these notes:\n"""\n${input.notes}\n"""`);
  return parts.join("\n");
}

/** Generates draft cards. Throws on auth/API errors so the route can surface them. */
export async function generateCards(input: GenerateInput): Promise<DraftCard[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system: SYSTEM,
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
      messages: [{ role: "user", content: buildPrompt(input) }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Anthropic API ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    stop_reason?: string;
    content?: Array<{ type: string; text?: string }>;
  };
  if (data.stop_reason === "refusal") throw new Error("Generation was refused by the safety system");

  const textBlock = data.content?.find((b) => b.type === "text" && typeof b.text === "string");
  if (!textBlock?.text) throw new Error("No text content returned");

  const parsed = JSON.parse(textBlock.text) as { cards?: DraftCard[] };
  if (!Array.isArray(parsed.cards)) throw new Error("Malformed card payload");

  // Normalize: ensure tags is an array, type is valid.
  return parsed.cards.map((c): DraftCard => ({
    front: String(c.front || "").trim(),
    back: String(c.back || "").trim(),
    type: c.type === "cloze" ? "cloze" : "basic",
    extra: c.extra ? String(c.extra).trim() : undefined,
    tags: Array.isArray(c.tags) ? c.tags.map(String) : [],
  })).filter((c) => c.front && c.back);
}
