// Claude study-note generation via the Messages API (raw fetch — edge-safe, no
// SDK, matching this repo's convention). Produces a First-Aid-aligned, exam-
// focused markdown summary ("4–5 pages") for a topic. Returns a draft {title,
// body}; nothing is persisted until the user saves it. Mirrors anthropic.ts.

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.USMLE_AI_MODEL || "claude-opus-4-8";

export interface NoteInput {
  topicName?: string; // e.g. "Cardiovascular → Heart Failure"
  disciplines?: string[];
  focus?: string; // optional sub-focus or "what to emphasize"
}

export interface DraftNote {
  title: string;
  body: string; // markdown
}

const SYSTEM = `You are an expert USMLE Step 1 tutor writing a concise, high-yield revision summary ("study note") for a single topic. The reader has already studied the material once and wants a dense, well-structured refresher for active revision in the months before the exam.

Write in GitHub-flavored Markdown. Structure it for fast review:
- Open with a one-paragraph high-yield overview.
- Use ## section headings (e.g. Physiology, Pathophysiology, Presentation, Diagnosis, Treatment, Complications, Classic associations).
- Prefer tight bullet points over prose. Bold the key term in each bullet.
- Show mechanisms as arrow chains in plain text (e.g. "↓ insulin → unopposed lipolysis → ketogenesis → anion-gap acidosis").
- Include a "## Buzzwords & classic associations" section mapping triggers/findings → diagnosis.
- End with a "## Rapid review" section: a Markdown table of the most testable discriminators.
- Do NOT use HTML, images, or mermaid; tables and arrow chains only.

Sourcing & integrity:
- This summary mirrors First Aid for the USMLE Step 1 organization. Where helpful, note the relevant First Aid chapter/section inline (e.g. "(FA: Cardiovascular — Pathology)"); do NOT cite page numbers (they drift across editions) and do NOT reproduce First Aid text verbatim — write original phrasing.
- Be medically accurate and mechanism-first. Omit anything you are unsure of rather than guessing.
- Keep it focused and exam-relevant — roughly 4–5 printed pages of dense notes, not a textbook chapter.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    body: { type: "string" },
  },
  required: ["title", "body"],
} as const;

function buildPrompt(input: NoteInput): string {
  const parts: string[] = ["Write a high-yield USMLE Step 1 revision summary."];
  if (input.topicName) parts.push(`Topic: ${input.topicName}.`);
  if (input.disciplines?.length) parts.push(`Emphasize disciplines: ${input.disciplines.join(", ")}.`);
  if (input.focus) parts.push(`Pay special attention to: ${input.focus}.`);
  parts.push('Return a concise "title" (the topic name) and the markdown "body".');
  return parts.join("\n");
}

/** Generates a draft study note. Throws on auth/API errors so the route can surface them. */
export async function generateNote(input: NoteInput): Promise<DraftNote> {
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
      max_tokens: 12000,
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

  const parsed = JSON.parse(textBlock.text) as { title?: string; body?: string };
  const title = String(parsed.title || input.topicName || "Untitled note").trim();
  const body = String(parsed.body || "").trim();
  if (!body) throw new Error("Empty note body returned");
  return { title, body };
}
