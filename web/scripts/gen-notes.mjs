// Generates First-Aid-aligned study notes (markdown, with Mermaid flowcharts)
// for the high-yield subtopics, one note per flashcard deck. Writes JSON drafts
// to stdout for accuracy review before loading (notes-to-sql.mjs → D1).
// Mirrors lib/usmle/notes.ts (same model, schema, system prompt).
//
// Usage:
//   node scripts/gen-notes.mjs cardiovascular endocrine renal respiratory > /tmp/usmle-notes.json
// Reads ANTHROPIC_API_KEY from web/.env.local (falls back to process.env).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODEL = process.env.USMLE_AI_MODEL || "claude-opus-4-8";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

function loadApiKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  try {
    const env = readFileSync(join(__dirname, "..", ".env.local"), "utf8");
    const m = env.match(/^\s*ANTHROPIC_API_KEY\s*=\s*(.+)\s*$/m);
    if (m) return m[1].trim().replace(/^['"]|['"]$/g, "");
  } catch {}
  throw new Error("ANTHROPIC_API_KEY not found (env or web/.env.local)");
}

// One note per high-yield subtopic; topicId = taxonomy leaf (pairs with the deck).
const TOPICS = {
  cardiovascular: [
    { name: "Cardiac Physiology: Pressure-Volume Loops & Action Potentials", topicId: "cardiovascular.physiology", disciplines: ["physiology"] },
    { name: "Valvular Heart Disease & Murmurs", topicId: "cardiovascular.pathology", disciplines: ["pathology", "physiology"] },
    { name: "Acute Coronary Syndrome & Complication Timing", topicId: "cardiovascular.pathology", disciplines: ["pathology"] },
    { name: "Congestive Heart Failure: Causes, Signs, Treatments", topicId: "cardiovascular.pathology", disciplines: ["pathology", "physiology", "pharmacology"] },
    { name: "Cardiomyopathies: Hypertrophic vs Dilated vs Restrictive", topicId: "cardiovascular.pathology", disciplines: ["pathology"] },
    { name: "Congenital Heart Disease: Cyanotic vs Acyanotic", topicId: "cardiovascular.pathology", disciplines: ["pathology", "anatomy"] },
    { name: "Cardiovascular Pharmacology: Antiarrhythmics & Antihypertensives", topicId: "cardiovascular.pharmacology", disciplines: ["pharmacology"] },
  ],
  endocrine: [
    { name: "Diabetes Mellitus: Type 1 vs Type 2, Complications, Treatments", topicId: "endocrine.pancreas-diabetes", disciplines: ["pathology", "physiology", "pharmacology"] },
    { name: "Thyroid Disorders: Hypo vs Hyper, Thyroid Storm", topicId: "endocrine.thyroid", disciplines: ["pathology", "physiology"] },
    { name: "Calcium Regulation: PTH, Vitamin D, Renal Effects", topicId: "endocrine.thyroid", disciplines: ["physiology", "pathology"] },
    { name: "ADH Physiology & Pathology: Diabetes Insipidus, SIADH", topicId: "endocrine.pituitary", disciplines: ["physiology", "pathology"] },
    { name: "Cortisol Physiology & Cushing's Syndrome", topicId: "endocrine.adrenal", disciplines: ["physiology", "pathology"] },
    { name: "Disorders of Sex Development: CAH, Androgen Insensitivity", topicId: "endocrine.adrenal", disciplines: ["pathology", "genetics"] },
  ],
  renal: [
    { name: "Kidney Physiology: Nephron Segments & Transporters", topicId: "renal.physiology", disciplines: ["physiology"] },
    { name: "Nephrotic vs Nephritic Syndromes", topicId: "renal.pathology", disciplines: ["pathology"] },
    { name: "Diuretics: MOA, Side Effects, Sites of Action", topicId: "renal.pharmacology", disciplines: ["pharmacology"] },
    { name: "Acid-Base Balance: Anion-Gap Metabolic Acidosis", topicId: "renal.acid-base", disciplines: ["physiology"] },
    { name: "Nephrolithiasis: Stone Types & Prevention", topicId: "renal.pathology", disciplines: ["pathology"] },
  ],
  respiratory: [
    { name: "Pneumonia: Typical vs Atypical Organisms", topicId: "respiratory.pathology", disciplines: ["pathology", "microbiology"] },
    { name: "COPD & Asthma: Pathophysiology + Treatment", topicId: "respiratory.pathology", disciplines: ["pathology", "pharmacology"] },
    { name: "Lung Cancer & Paraneoplastic Syndromes", topicId: "respiratory.pathology", disciplines: ["pathology"] },
    { name: "Pulmonary Embolism: Diagnosis & Management", topicId: "respiratory.pathology", disciplines: ["pathology", "physiology"] },
    { name: "Tuberculosis: Primary vs Reactivation", topicId: "respiratory.pathology", disciplines: ["pathology", "microbiology"] },
    { name: "Sarcoidosis: Granulomas, Lung & Systemic Involvement", topicId: "respiratory.pathology", disciplines: ["pathology"] },
  ],
};

const SYSTEM = `You are an expert USMLE Step 1 tutor writing a concise, high-yield revision summary ("study note") for ONE focused subtopic. The reader has already studied the material once and wants a dense, well-structured refresher for active revision in the months before the exam. Cover only the given subtopic in depth — do not sprawl into the whole organ system.

Write in GitHub-flavored Markdown. Structure it for fast review:
- Open with a one-paragraph high-yield overview.
- Use ## section headings (e.g. Physiology, Pathophysiology, Presentation, Diagnosis, Treatment, Complications, Classic associations).
- Prefer tight bullet points over prose. Bold the key term in each bullet.
- Show mechanisms as arrow chains in plain text (e.g. "↓ insulin → unopposed lipolysis → ketogenesis → anion-gap acidosis").
- Include 1–2 visual flowcharts as Mermaid diagrams for the most important pathophysiology cascade and/or a diagnostic/management algorithm (see strict Mermaid rules below).
- Include a "## Buzzwords & classic associations" section mapping triggers/findings → diagnosis.
- End with a "## Rapid review" section: a Markdown table of the most testable discriminators.
- Do NOT use HTML or images. Tables, text arrow-chains, and Mermaid flowcharts only.

Mermaid rules (follow EXACTLY — invalid syntax will fail to render):
- Use a fenced code block whose info string is exactly \`mermaid\`.
- Use only \`flowchart TD\` (top-down) or \`flowchart LR\` (left-right). No other diagram types.
- Node ids are short alphanumeric (A, B, C1...). Put the visible text in double quotes: \`A["Decreased cardiac output"]\`.
- Edge labels (optional) also use double quotes: \`A -->|"if severe"| B\`.
- Inside quoted labels use ONLY letters, numbers, spaces, and these symbols: , . / % + - : ↑ ↓ →. Do NOT put parentheses (), brackets [], braces {}, pipes, or semicolons inside a label (write "e.g." as "eg", spell out ranges).
- Keep each diagram to ~5–10 nodes. Example:
\`\`\`mermaid
flowchart TD
  A["↓ Cardiac output"] --> B["RAAS activation"]
  B --> C["Angiotensin II: vasoconstriction → ↑ afterload"]
  B --> D["Aldosterone: Na/water retention → ↑ preload"]
  C --> E["Maladaptive remodeling"]
  D --> E
\`\`\`

Sourcing & integrity:
- This summary mirrors First Aid for the USMLE Step 1 organization. Where helpful, note the relevant First Aid chapter/section inline (e.g. "(FA: Cardiovascular — Pathology)"); do NOT cite page numbers (they drift across editions) and do NOT reproduce First Aid text verbatim — write original phrasing.
- Be medically accurate and mechanism-first. Omit anything you are unsure of rather than guessing.
- Keep it focused and exam-relevant — roughly 4–5 printed pages of dense notes on this one subtopic, not a textbook chapter.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: { title: { type: "string" }, body: { type: "string" } },
  required: ["title", "body"],
};

async function generate(apiKey, topic) {
  const prompt = `Write a high-yield USMLE Step 1 revision summary.
Topic: ${topic.name}.
Emphasize disciplines: ${topic.disciplines.join(", ")}.
Return a concise "title" (the topic name) and the markdown "body".`;
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 14000,
      thinking: { type: "adaptive" },
      system: SYSTEM,
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  if (data.stop_reason === "refusal") throw new Error("refused");
  const text = data.content?.find((b) => b.type === "text" && b.text)?.text;
  if (!text) throw new Error("no text content");
  const parsed = JSON.parse(text);
  return { title: String(parsed.title || topic.name).trim(), body: String(parsed.body || "").trim() };
}

async function main() {
  const systems = process.argv.slice(2);
  if (systems.length === 0) { console.error("usage: node gen-notes.mjs <system> [system...]"); process.exit(1); }
  const apiKey = loadApiKey();
  const out = [];
  for (const sys of systems) {
    const specs = TOPICS[sys];
    if (!specs) { console.error(`unknown system: ${sys}`); process.exit(1); }
    for (const topic of specs) {
      process.stderr.write(`generating: ${topic.name} ... `);
      const note = await generate(apiKey, topic);
      const diagrams = (note.body.match(/```mermaid/g) || []).length;
      process.stderr.write(`${note.body.length} chars, ${diagrams} diagram(s)\n`);
      out.push({ system: sys, topicId: topic.topicId, title: note.title, body: note.body, source: "ai" });
    }
  }
  process.stdout.write(JSON.stringify(out, null, 2) + "\n");
  process.stderr.write(`\nDONE: ${out.length} notes\n`);
}

main().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
