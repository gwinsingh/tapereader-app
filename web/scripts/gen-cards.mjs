// Generates high-yield USMLE Step 1 flashcards via the Anthropic Messages API
// and writes them as JSON drafts (for human/Claude accuracy review BEFORE they
// hit the DB). A second pass (cards-to-sql.mjs) turns the reviewed JSON into
// idempotent SQL loaded with `wrangler d1 execute --remote --file`.
//
// Mirrors lib/usmle/anthropic.ts (same model, schema, mechanism-first system
// prompt) but adds a First-Aid sourcing instruction per the student's request.
//
// Usage:
//   node scripts/gen-cards.mjs cardiovascular > /tmp/usmle-cards-cardiovascular.json
//   node scripts/gen-cards.mjs cardiovascular endocrine renal respiratory > /tmp/usmle-cards-all.json
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

// --- Deck specs: deck = student's subtopic, topicId = taxonomy leaf it rolls up to.
const DECKS = {
  cardiovascular: [
    { name: "CV — Pressure-Volume Loops & Cardiac Action Potentials", topicId: "cardiovascular.physiology", disciplines: ["physiology"] },
    { name: "CV — Valvular Heart Disease & Murmurs", topicId: "cardiovascular.pathology", disciplines: ["pathology", "physiology"] },
    { name: "CV — Acute Coronary Syndrome & Complication Timing", topicId: "cardiovascular.pathology", disciplines: ["pathology"] },
    { name: "CV — Congestive Heart Failure (Causes, Signs, Tx)", topicId: "cardiovascular.pathology", disciplines: ["pathology", "physiology"] },
    { name: "CV — Cardiomyopathies (Hypertrophic / Dilated / Restrictive)", topicId: "cardiovascular.pathology", disciplines: ["pathology"] },
    { name: "CV — Congenital Heart Disease (Cyanotic vs Acyanotic)", topicId: "cardiovascular.pathology", disciplines: ["pathology", "anatomy"] },
    { name: "CV — Pharmacology (Antiarrhythmics & Antihypertensives)", topicId: "cardiovascular.pharmacology", disciplines: ["pharmacology"] },
  ],
  endocrine: [
    { name: "Endo — Diabetes Mellitus (T1 vs T2, Complications, Tx)", topicId: "endocrine.pancreas-diabetes", disciplines: ["pathology", "physiology", "pharmacology"] },
    { name: "Endo — Thyroid Disorders & Thyroid Storm", topicId: "endocrine.thyroid", disciplines: ["pathology", "physiology"] },
    { name: "Endo — Calcium Regulation (PTH, Vitamin D, Renal Effects)", topicId: "endocrine.thyroid", disciplines: ["physiology", "pathology"] },
    { name: "Endo — ADH Physiology & Pathology (DI & SIADH)", topicId: "endocrine.pituitary", disciplines: ["physiology", "pathology"] },
    { name: "Endo — Cortisol Physiology & Cushing's Syndrome", topicId: "endocrine.adrenal", disciplines: ["physiology", "pathology"] },
    { name: "Endo — Disorders of Sex Development (CAH, Androgen Insensitivity)", topicId: "endocrine.adrenal", disciplines: ["pathology", "genetics"] },
  ],
  renal: [
    { name: "Renal — Nephron Segments & Transporters", topicId: "renal.physiology", disciplines: ["physiology"] },
    { name: "Renal — Nephrotic vs Nephritic Syndromes", topicId: "renal.pathology", disciplines: ["pathology"] },
    { name: "Renal — Diuretics (MOA, Sites of Action, Side Effects)", topicId: "renal.pharmacology", disciplines: ["pharmacology"] },
    { name: "Renal — Anion-Gap Metabolic Acidosis & Acid-Base", topicId: "renal.acid-base", disciplines: ["physiology"] },
    { name: "Renal — Nephrolithiasis (Stone Types & Prevention)", topicId: "renal.pathology", disciplines: ["pathology"] },
  ],
  respiratory: [
    { name: "Resp — Pneumonia (Typical vs Atypical Organisms)", topicId: "respiratory.pathology", disciplines: ["pathology", "microbiology"] },
    { name: "Resp — COPD & Asthma (Pathophysiology + Tx)", topicId: "respiratory.pathology", disciplines: ["pathology", "pharmacology"] },
    { name: "Resp — Lung Cancer & Paraneoplastic Syndromes", topicId: "respiratory.pathology", disciplines: ["pathology"] },
    { name: "Resp — Pulmonary Embolism (Dx & Management)", topicId: "respiratory.pathology", disciplines: ["pathology", "physiology"] },
    { name: "Resp — Tuberculosis (Primary vs Reactivation)", topicId: "respiratory.pathology", disciplines: ["pathology", "microbiology"] },
    { name: "Resp — Sarcoidosis (Granulomas, Lung + Systemic)", topicId: "respiratory.pathology", disciplines: ["pathology"] },
  ],
};

const COUNT = 12;

const SYSTEM = `You are an expert USMLE Step 1 tutor creating spaced-repetition flashcards.
Rules:
- Step 1 is mechanism-first: prefer cards that test the "why"/causal reasoning behind a fact, not rote definitions.
- One discrete fact or mechanism per card. Keep fronts as focused questions; keep backs concise.
- Use NBME vignette-style framing where natural, but cards should be quick to review.
- Where a memory hook helps, put a brief mnemonic in "extra". Otherwise omit it.
- Source alignment: these mirror First Aid for the USMLE Step 1 content. In "extra", note the First Aid chapter/section the fact lives in (e.g. "FA: Cardiovascular — Pathology"); do NOT cite page numbers (they drift across editions) and do NOT copy First Aid text verbatim — author original phrasing.
- "type" is "basic" (front question / back answer). Do not produce cloze cards.
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
};

async function generate(apiKey, deck) {
  const prompt = `Generate ${COUNT} high-yield USMLE Step 1 flashcards.
Topic: ${deck.name}.
Emphasize disciplines: ${deck.disciplines.join(", ")}.
Focus on the highest-yield, most-tested mechanisms and discriminators for this exact subtopic.`;

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
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  if (data.stop_reason === "refusal") throw new Error("refused");
  const text = data.content?.find((b) => b.type === "text" && b.text)?.text;
  if (!text) throw new Error("no text content");
  const parsed = JSON.parse(text);
  const cards = (parsed.cards || [])
    .map((c) => ({
      front: String(c.front || "").trim(),
      back: String(c.back || "").trim(),
      type: c.type === "cloze" ? "cloze" : "basic",
      extra: c.extra ? String(c.extra).trim() : undefined,
      tags: Array.isArray(c.tags) ? c.tags.map(String) : [],
    }))
    .filter((c) => c.front && c.back);
  return { ...data._usage, cards };
}

async function main() {
  const systems = process.argv.slice(2);
  if (systems.length === 0) {
    console.error("usage: node gen-cards.mjs <system> [system...]  (cardiovascular endocrine renal respiratory)");
    process.exit(1);
  }
  const apiKey = loadApiKey();
  const out = [];
  for (const sys of systems) {
    const specs = DECKS[sys];
    if (!specs) {
      console.error(`unknown system: ${sys}`);
      process.exit(1);
    }
    for (const deck of specs) {
      process.stderr.write(`generating: ${deck.name} ... `);
      const { cards } = await generate(apiKey, deck);
      process.stderr.write(`${cards.length} cards\n`);
      out.push({ system: sys, name: deck.name, topicId: deck.topicId, source: "ai", cards });
    }
  }
  process.stdout.write(JSON.stringify(out, null, 2) + "\n");
  const total = out.reduce((n, d) => n + d.cards.length, 0);
  process.stderr.write(`\nDONE: ${out.length} decks, ${total} cards\n`);
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
