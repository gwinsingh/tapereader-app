# USMLE Step 1 Prep App — Master Plan

> **Status:** Living document. v1 — 2026-06-21.
> **Purpose:** This is the canonical source-of-truth for building a USMLE Step 1 preparation web app for a single student. It is written to be **fed verbatim into future chats** as context. Each future chat should treat this file as the shared brief: read the relevant section, implement, then update the relevant section (especially §11 Decisions Log and §10 Build Backlog) so the document stays current.
>
> **How to use this doc in a new chat:** paste it (or point the agent at `docs/usmle-prep-app/master-plan.md`), state which phase/feature you're working on, and the agent has full context. Keep it refined over time.

---

## 1. Context & Constraints

| Item | Value |
|------|-------|
| **Who** | One medical student preparing for USMLE Step 1. Single user — no multi-tenant auth needed. |
| **Where it lives** | New section inside the existing **TapeReader** repo: Next.js 15 App Router on Cloudflare Pages (edge runtime), same patterns as `pct-bootcamp` and `4-week-challenge`. |
| **Today** | 2026-06-21. |
| **Progress** | ~1/3 of Step 1 topics studied. |
| **Exam target** | **Mid–late October 2026** (~4 months out). |
| **Study timeline** | **Jun:** continue (already mid-flight). **Jul–Aug:** finish the remaining ~2/3 of topics. **Sep:** gap-fill + solidify (dedicated-style). **Mid/late Oct:** exam. |
| **Existing resources** | Student already owns the standard stack (UWorld, First Aid, Pathoma, Sketchy, Boards & Beyond, AnKing/Anki, NBME self-assessments). The app must **complement**, not replace, these. |
| **Near-term focus** | **Flashcards feature** (see §8 — the deepest section). |

### Guiding principles
1. **Complement the proven stack, don't reinvent it.** Students pass Step 1 with a *tight* stack they actually finish. The app's value is in the gaps the big resources leave: integrated topic-progress tracking, weakness-driven review, and AI-assisted card generation tied to the student's own mistakes. It is not "another QBank" or "another video course."
2. **Active recall + spaced repetition over passive review.** Every feature should push toward testing, not reading.
3. **Map everything to the real exam taxonomy** (§3) so progress %, weak-area analytics, and AI card generation all speak the same vocabulary the NBME uses.
4. **Ship lean, ship fast.** 4-month runway. Flashcards MVP must be usable within weeks, not months.
5. **Single-user simplicity.** No accounts, no sign-up flows. A lightweight "this is me" pointer + a write key (like `4-week-challenge`) is enough. Don't over-build identity.

---

## 2. USMLE Step 1 — Exam Overview (grounding for the whole app)

Step 1 is a **pass/fail**, one-day, computer-based exam testing the *foundational sciences* and the ability to **apply** them to clinical vignettes. Since Jan 2022 there is **no 3-digit score reported** — only Pass/Fail — which changes the optimal strategy: the goal is reliable competence across all systems (no weak hole that sinks you), **not** score-maxing. This shapes the app: prioritize **breadth coverage + eliminating weak areas** over chasing a high number.

### 2.1 Format (note the May 14, 2026 change — **applies to this student**)
Because the exam is in October 2026, the **new format** applies:

| Attribute | New format (on/after **May 14, 2026**) |
|-----------|----------------------------------------|
| Structure | **Fourteen 30-minute blocks**, one 8-hour session |
| Questions/block | Varies, **≤ 20** |
| Total questions | **≤ 280** |
| Break time | ≥ 55 min total (earn more by finishing blocks early) |
| Tutorial | 5-min optional |
| Question style | Single-best-answer multiple choice, clinical vignettes |

*(Old pre-May-14 format was 7×60-min blocks, ≤40 q/block — irrelevant for this student but noted so the app's "exam simulator," if built, models the correct shape.)*

### 2.2 Scoring
- **Pass/Fail only.** Passing standard = 196 on the legacy 3-digit scale (reaffirmed Dec 2024).
- Roughly **~60% correct** is the approximate passing threshold (varies by form).
- **Implication for the app:** target metric is "can the student reliably clear ~60–70% across *every* system." Surface **lowest-performing systems** prominently — a single weak organ system is the real risk.

---

## 3. Content Outline & Weightings (the app's topic taxonomy backbone)

The NBME builds every form from two crossed dimensions: **(A) Organ Systems** and **(B) Physician Tasks/Competencies**. There is also a **Discipline** view. The app's topic taxonomy should be modeled on the **Organ Systems** dimension (primary tree), tagged with **Discipline** and **Task** as secondary facets. This makes progress %, analytics, and AI-card generation align with how the exam is actually built.

> **2026 update note:** The old "General Principles of Foundational Science" bucket was **redistributed into the organ-system categories**, and a new **"Human Development"** category was added. Multisystem integration is emphasized.

### 3.1 Organ Systems (primary axis) — approximate 2026 weightings
> Use these as the top-level nodes of the topic tree. Percentages are ranges from the published outline; treat as relative priority weights, not exact.

| Organ System (top-level node) | Approx. weight | Priority |
|-------------------------------|---------------|----------|
| Reproductive & Endocrine | 12–16% | ★★★ highest |
| Nervous System & Special Senses | 11–15% | ★★★ |
| Cardiovascular | 10–14% | ★★★ |
| Respiratory | 6–10% | ★★ |
| Renal/Urinary | 6–10% | ★★ |
| Gastrointestinal | 6–10% | ★★ |
| Musculoskeletal | 6–10% | ★★ |
| Skin/Subcutaneous (Dermatology) | ~4–7% | ★★ |
| Blood & Lymphoreticular / Immune | ~4–9% | ★★ |
| Behavioral Health / Psychiatry | ~4–7% | ★★ |
| Multisystem Processes & Disorders (incl. infectious, neoplasia, nutrition) | cross-cutting | ★★ |
| Biostatistics, Epidemiology & Population Health | ~1–9% | ★★ |
| Human Development (new 2026 category) | small | ★ |
| Social Sciences (communication, ethics, professionalism) | small | ★ |

*(Exact official node list and sub-weights live at usmle.org — §12 link. When building the seed taxonomy, pull the official outline PDF and mirror its exact node names so the app vocabulary matches the NBME's.)*

### 3.2 Discipline view (secondary facet/tag on each topic)
| Discipline | Approx. weight |
|-----------|----------------|
| Pathology | 44–52% (dominant) |
| Physiology | 25–35% |
| Pharmacology | 15–22% |
| Biochemistry & Molecular Biology | 14–24% |
| Microbiology & Immunology | 10–15% |
| Anatomy & Embryology | 10–15% |
| Behavioral Science & Biostatistics | 10–15% |
| Genetics | 5–9% |

*(Disciplines overlap and sum >100% because a single vignette tests several. Pathology + Physiology + Pharmacology dominate — weight AI card generation and review accordingly.)*

### 3.3 Physician Tasks/Competencies view (secondary facet)
| Competency | Approx. weight |
|-----------|----------------|
| Applying Foundational Science Concepts (the "why/mechanism") | 55–65% |
| Diagnosis (history, exam, lab/diagnostics) | 15–20% |
| Health maintenance, pharmacotherapy & intervention | 15–20% |

**Design takeaway:** the exam is **mechanism-first**. Cards and content should bias toward *"why does this happen"* reasoning, not rote fact lists. AI card generation prompts should be tuned to produce mechanism/causal cards, not just definitions.

---

## 4. Existing Resource Ecosystem (what the app sits alongside)

The app must integrate *conceptually* with these — e.g., let the student tag a card or topic with its source — without trying to embed copyrighted content.

| Resource | Role | App's relationship |
|----------|------|--------------------|
| **UWorld** | Gold-standard QBank (~3,600 Step 1 Qs). The single most important resource. | App tracks which UWorld blocks/systems are done + logs missed-question concepts → feed AI card generation. |
| **AnKing / Anki** | De-facto community flashcard deck. The flashcard incumbent. | **Key interop target.** Most students already run AnKing. The app's flashcards must offer something Anki doesn't (topic-progress integration, AI generation from *their* mistakes) and ideally **import .apkg** so they aren't forced to abandon AnKing. |
| **Pathoma** | Pathology video + text (Dr. Sattar). Pathology is ~half the exam. | Topic taxonomy can map Pathoma chapters → organ systems for progress tracking. |
| **Sketchy** | Visual mnemonics for Micro & Pharm. | Tag micro/pharm cards with Sketchy reference. |
| **Boards & Beyond** | Conceptual video lectures. | Optional; map chapters to topics for the study planner. |
| **First Aid** | Reference compendium. Less central in pass/fail era (passive). | Use its chapter structure as a familiar cross-reference for the topic tree. |
| **NBME self-assessments + Free 120** | Official practice, best readiness predictor. | Phase-later: log NBME scores to gauge readiness; the single best "are you ready" signal. |

**Strategic insight:** Resource overload is the #1 cause of failure, not lack of knowledge. The app should *reduce* cognitive load — one place to see "what's done, what's weak, what to review today" — not add a 13th thing to juggle.

---

## 5. App Vision & Feature Map

**One-line vision:** *A single dashboard that tells the student what they've covered, what's weak, and exactly what to review today — backed by spaced-repetition flashcards that the AI can generate from their own gaps and mistakes.*

### Feature pillars
1. **Topic Tracker** — the exam taxonomy (§3) as a checklist tree with per-node status (not started / learning / reviewed / confident) and weighted overall % coverage. This is what answers "I've done 1/3."
2. **Flashcards (SRS)** — the near-term build. Spaced-repetition review tied to the topic tree. *(See §8.)*
3. **Weakness Analytics** — surface lowest-coverage / lowest-recall systems vs. exam weight, so effort goes where it moves the pass-needle most.
4. **Study Planner** — map the Jun→Oct timeline onto the topic tree; generate a "today" queue (new topics + due cards + weak-area review).
5. **AI Tutor / Card Generator** — Claude-powered: generate cards from a topic or a pasted missed-question concept; explain mechanisms; quiz the student.
6. **(Later) QBank-style practice & exam simulator** — vignette questions in the new 14×30-min format; readiness tracking via NBME score logging.

---

## 6. Architecture

Follows the repo's established edge-first patterns (see root `CLAUDE.md`).

- **Section path:** `web/app/usmle/` (App Router). Mirrors `pct-bootcamp` structure: section `layout.tsx`, theme handling, header visibility rule.
- **Runtime:** every API route `export const runtime = 'edge'`. No Node APIs. Use Web Crypto / raw `fetch` if external services are needed.
- **Theming:** reuse the PCT CSS-custom-property theme system (`var(--color-*)`, `data-theme`, `localStorage`) rather than hardcoded Tailwind, so dark/light works consistently. Consider a separate theme key (`usmle-theme`).
- **Identity:** single user. A lightweight localStorage "who am I" pointer + a `WRITE_KEY`-style shared secret for writes (same approach as `4-week-challenge`). No real auth.

### 6.1 Data storage — recommendation: **Cloudflare D1** (serverless SQLite)
The flashcard/SRS workload is **relational and write-heavy** (cards, decks, review logs that grow daily, FSRS per-card state). Options considered:

| Option | Fit | Verdict |
|--------|-----|---------|
| **Cloudflare D1 (SQLite at edge)** | Relational schema, indexes on due-date, transactional review writes, grows cleanly. | ✅ **Recommended primary store.** Natural fit for SRS. Bind via `wrangler.toml` (dashboard bindings are locked — see repo memory). |
| Cloudflare KV (used by 4-week-challenge) | Great for whole-blob JSON, but per-card review logs + due-queue queries are awkward; eventual-consistency + no queries. | ⚠️ OK only for a throwaway MVP storing a single JSON blob; will need migration. |
| Google Sheets (used by trade journal) | Wrong tool — not for high-frequency review writes. | ❌ |

**Decision (provisional, see §11):** Use **D1**. If we want a zero-binding MVP in week 1, we *may* start with a single KV JSON blob and migrate to D1 once the schema stabilizes — but prefer going straight to D1 to avoid a migration.

> Action item for the build chat: add a `usmle_db` D1 binding in `web/wrangler.toml`, create migrations under `web/migrations/` (or a `web/db/` folder), and a thin query helper in `web/lib/usmle/db.ts`.

---

## 7. Data Model (initial)

Tables (D1/SQLite). Names indicative; refine in the build chat.

```
topics
  id              TEXT PK            -- stable slug, e.g. "cardiovascular.heart-failure"
  parent_id       TEXT NULL         -- self-ref tree (organ system → subtopic)
  name            TEXT
  organ_system    TEXT              -- top-level §3.1 node
  disciplines     TEXT              -- JSON array of §3.2 tags
  exam_weight     REAL NULL         -- relative priority from §3
  sort_order      INTEGER

topic_progress
  topic_id        TEXT PK FK
  status          TEXT              -- not_started | learning | reviewed | confident
  confidence      INTEGER NULL      -- 1..5 self-rating
  updated_at      TEXT

decks
  id              TEXT PK
  name            TEXT
  topic_id        TEXT NULL FK      -- optional binding to a topic node
  source          TEXT              -- manual | ai | imported_anki
  created_at      TEXT

cards
  id              TEXT PK
  deck_id         TEXT FK
  topic_id        TEXT NULL FK
  type            TEXT              -- basic | cloze | image_occlusion(later)
  front           TEXT              -- markdown
  back            TEXT              -- markdown
  extra           TEXT NULL         -- mnemonic, source ref (e.g. "Pathoma 3.2")
  tags            TEXT              -- JSON array (discipline, sketchy, etc.)
  source          TEXT              -- manual | ai | imported
  suspended       INTEGER DEFAULT 0
  created_at      TEXT

card_srs                            -- FSRS per-card memory state (see §8.2)
  card_id         TEXT PK FK
  due            TEXT               -- next review datetime (UTC)
  stability       REAL
  difficulty      REAL
  state           TEXT              -- new | learning | review | relearning
  reps            INTEGER
  lapses          INTEGER
  last_review     TEXT NULL
  scheduled_days  INTEGER

review_log                          -- append-only; powers FSRS optimization + analytics
  id              TEXT PK
  card_id         TEXT FK
  rating          INTEGER           -- 1=Again 2=Hard 3=Good 4=Easy
  state           TEXT              -- state at review time
  elapsed_days    INTEGER
  scheduled_days  INTEGER
  stability       REAL
  difficulty      REAL
  reviewed_at     TEXT
  duration_ms     INTEGER NULL
```

**Why `review_log` is append-only and important:** FSRS gets *better* the more real review history it has — it can re-optimize its parameters from the log. Never delete it.

---

## 8. NEAR-TERM FOCUS — Flashcards Feature (deep dive)

This is what we build first. Everything below is the spec.

### 8.1 Recommendation on approach (my call, as requested)
The student already uses AnKing/Anki. So the flashcards feature **must justify its existence** vs. just opening Anki. The differentiator is **integration + AI**, not replacing the SRS engine. Recommended composition:

| Capability | In MVP? | Rationale |
|-----------|---------|-----------|
| **FSRS spaced-repetition engine** | ✅ **Yes — core** | Modern (Anki's default since v23.10), needs **20–30% fewer reviews** than SM-2 for the same retention. Critical when review volume is huge and time is short. Self-tuning. |
| **Manual card authoring** | ✅ **Yes** | Baseline; needed for student's own cards. Cheap to build. |
| **AI-generated cards (Claude)** | ✅ **Yes — the differentiator** | Generate mechanism-focused cards from a topic node, pasted notes, or a missed UWorld concept. This is the thing Anki *can't* do natively and the main reason to build in-house. Ties directly to the topic taxonomy + weakness analytics. |
| **Anki `.apkg` import** | 🔜 **Fast-follow (Phase 2), not MVP-blocking** | High interop value (don't force abandoning AnKing), but parsing `.apkg` (a zip of a SQLite `collection.anki2` + media) is non-trivial. On Cloudflare edge it's best done **client-side with `sql.js` (WASM)** then POST parsed cards. Worth doing, but after the MVP loop works. |
| Image occlusion / cloze-rich types | 🔜 Later | Cloze is moderate effort and high-yield for med; image occlusion is a bigger lift. Add cloze in Phase 2, image occlusion later. |

**Bottom line:** MVP = **FSRS engine + manual authoring + AI generation**, with a clean review UI. Anki import and cloze come right after.

### 8.2 Spaced-repetition engine — **FSRS** (chosen)
- **Why FSRS over SM-2:** FSRS models memory with three quantities and predicts recall probability, scheduling each card at the point you're about to forget it. SM-2 just applies a fixed 1987 formula with a single "ease" number and no memory model. Benchmarks (500M+ Anki reviews) show **FSRS needs ~20–30% fewer reviews** for equal retention — directly relevant to a time-boxed Step 1 grind.
- **FSRS memory state (per card, in `card_srs`):**
  - **Difficulty (1–10):** intrinsic hardness of the card.
  - **Stability (days):** how long until recall probability decays to 90%.
  - **Retrievability:** predicted probability you can recall it *right now* (derived from stability + elapsed time).
- **Ratings:** 4-button — **Again (1) / Hard (2) / Good (3) / Easy (4)** — exactly Anki's scheme, so the muscle memory transfers.
- **Implementation:** use a maintained JS/TS FSRS library (e.g. the `ts-fsrs` package from the open-spaced-repetition org) rather than hand-rolling the math. It's pure functions — edge-runtime safe. Feed it the card's current state + rating + now → it returns the new state + next `due`.
- **Config knob:** target **desired retention** (default ~0.90). Let the student raise it (more reviews, higher retention) as the exam nears.
- **Later optimization:** once enough `review_log` rows exist, run the FSRS optimizer to fit personalized parameters. Not needed for MVP (use the published default weights).

### 8.3 AI card generation (Claude) — design
- **Model:** default to the latest capable Claude (per repo guidance, e.g. `claude-opus-4-8` for quality, or a faster model for cheap bulk gen — decide per cost in the build chat). Use the Anthropic API via `fetch` (edge-safe; no Node SDK needed — mirror the existing Web-Crypto/raw-fetch ethos).
- **Generation inputs (any of):**
  1. A **topic node** ("generate 15 cards on Cardiovascular → Heart Failure").
  2. **Pasted notes / lecture text** the student wants carded.
  3. A **missed-question concept** ("I got a UWorld Q wrong about why ACE inhibitors cause hyperkalemia") → mechanism cards around it.
- **Prompt design:** tune toward **mechanism/causal reasoning** cards (matches the 55–65% "apply foundational science" weighting), NBME vignette style, one fact per card, with `extra` mnemonic where natural. Return **structured JSON** (front/back/type/tags/topic_id) so it inserts straight into `cards`.
- **Human-in-the-loop:** generated cards land in a **review/approve queue** before entering the deck — never auto-add unverified medical facts to the study set. Student edits/accepts/rejects.
- **Tagging:** AI tags each card with discipline + organ system so analytics and filtering work.

### 8.4 Review experience (UX)
- **Today queue:** due cards (FSRS) + optional new-card intro limit/day. Big, fast, keyboard-driven (1–4 to rate, space to flip) — speed matters at med-school volume.
- **Card render:** markdown front/back, mnemonic reveal, source ref, topic breadcrumb. Cloze support in Phase 2.
- **Session feedback:** counts (new/learning/due), retention trend, and which **organ systems** the session touched.
- **Suspend / bury / edit** inline.
- **Mobile-friendly:** the student will review on a phone — responsive, thumb-reachable rating buttons.

### 8.5 API routes (edge) — sketch
```
GET    /api/usmle/review/queue        → due + new cards for today
POST   /api/usmle/review/grade        → {cardId, rating} → FSRS update + log
GET    /api/usmle/decks               → list decks
POST   /api/usmle/cards               → create card (manual)
PATCH  /api/usmle/cards/:id           → edit/suspend
POST   /api/usmle/ai/generate-cards   → {topicId|text|missedConcept} → draft cards (approval queue)
POST   /api/usmle/cards/bulk          → accept approved AI/imported cards
POST   /api/usmle/import/anki         → (Phase 2) accept client-parsed .apkg cards
GET    /api/usmle/topics              → taxonomy + progress
PATCH  /api/usmle/topics/:id/progress → update status/confidence
```

### 8.6 Flashcards build sequence (the actual near-term work)
1. **DB + bindings:** D1 binding in `wrangler.toml`, migrations for the §7 tables, `lib/usmle/db.ts` helper.
2. **Seed topic taxonomy** from the official §3 outline (organ systems + a first pass of subtopics).
3. **FSRS integration:** wire `ts-fsrs`; `grade` endpoint + `card_srs`/`review_log` writes.
4. **Manual card CRUD + decks.**
5. **Review UI:** today queue, flip, 1–4 rating, keyboard shortcuts, mobile layout.
6. **AI generation:** `generate-cards` endpoint + approval queue UI.
7. **Topic tracker UI** (basic): tree with status, overall weighted % — gives the "1/3 done" view and ties cards to topics.
8. *(Phase 2)* Anki `.apkg` client-side import; cloze cards; FSRS personalized optimization.

---

## 9. Roadmap — phased, mapped to the Jun→Oct timeline

| Phase | Calendar | Theme | Deliverables |
|-------|----------|-------|--------------|
| **P0 — Foundation** | late Jun – early Jul | Scaffolding | `web/app/usmle/` section, theme, D1 binding + migrations, seed topic taxonomy, "who am I" + write key. |
| **P1 — Flashcards MVP** | Jul | The core loop | FSRS engine, manual cards, review UI (today queue, 1–4 rating), AI card generation + approval queue. **Usable daily by July.** |
| **P2 — Topic Tracker + Analytics** | Jul – Aug | Coverage visibility | Topic tree with status/confidence, weighted % coverage ("how much of the exam have I covered"), weakness view (low coverage/recall vs. exam weight). Supports the Jul–Aug "finish remaining topics" push. |
| **P3 — Interop + richer cards** | Aug | Don't abandon AnKing | Anki `.apkg` import (client-side WASM parse), cloze cards, source/Sketchy/Pathoma tagging, FSRS param optimization from accumulated logs. |
| **P4 — Gap-fill & readiness** | Sep | Solidify | Study planner / "today plan" combining due cards + weak topics; NBME self-assessment score logging + simple readiness signal; missed-question → AI card pipeline tightened. Matches the Sep "gap-fill/solidify" phase. |
| **P5 — Practice & simulation (optional/stretch)** | Sep – Oct | Test conditions | Vignette practice questions, exam-shape simulator (14×30-min blocks), final weak-area blitz. Only if time allows — pass/fail means breadth coverage matters more than a custom QBank. |
| **Exam** | mid/late Oct | — | App used for final-week light review + due-card maintenance only (no new cards in the last days). |

> **Sequencing rule:** flashcards (P1) is the priority and must land early so the SRS clock starts ticking — spaced repetition only pays off with weeks of lead time. Everything else can slip; the review loop cannot.

---

## 10. Build Backlog (keep this current across chats)

- [x] P0: scaffold `web/app/usmle/` + section layout + theme + HeaderVisibility rule. *(layout.tsx, page.tsx dashboard, cards/ + topics/ placeholder pages; reuses ThemeToggle/PCTBodyStyle; HeaderVisibility hides main header on /usmle.)*
- [x] P0: add `usmle_db` D1 binding to `web/wrangler.toml`; write first migration; `lib/usmle/db.ts`. *(migrations/usmle/0001_init.sql; D1 typings + getDB helper. ⚠️ binding `database_id` is a TODO placeholder — run `npx wrangler d1 create usmle_db` and paste the id.)*
- [x] P0: topic taxonomy seeded. *(lib/usmle/taxonomy.ts = General Principles + 10 organ systems, First-Aid-level subtopics, NBME organ-system + discipline tags. Seed via `POST /api/usmle/seed` (write-key protected); `GET /api/usmle/topics` reads tree+progress. NOTE: still reconcile node names/weights vs official usmle.org PDF.)*
- [x] P0 (deploy step): D1 `usmle_db` created (id in wrangler.toml), migrations applied **remote + local**, taxonomy **seeded** (98 nodes) via `scripts/gen-seed.mjs` → `wrangler d1 execute` (no HTTP call needed; idempotent, mirrors `POST /api/usmle/seed`).
- [x] P1: integrate `ts-fsrs` (`lib/usmle/srs.ts`); `POST /api/usmle/review/grade` + `GET /api/usmle/review/queue`; writes `card_srs` + append-only `review_log`.
- [x] P1: manual card/deck CRUD — `decks` (GET/POST), `cards` (POST), `cards/[id]` (PATCH edit/suspend), `cards/bulk` (POST). New cards auto-create a `card_srs` row (due now) via `lib/usmle/cards.ts`.
- [x] P1: review UI — `components/usmle/ReviewSession.tsx` (today queue, flip, 1–4 keyboard ratings, mobile layout) + `CardComposer.tsx`; tabs in `app/usmle/cards/page.tsx`.
- [x] P1: AI `POST /api/usmle/ai/generate-cards` (Claude via raw fetch, `lib/usmle/anthropic.ts`, default `claude-opus-4-8`, structured-output JSON, adaptive thinking) + edit/approve queue in `CardComposer.tsx` → `cards/bulk`.
- [x] P1 (deploy step): `ANTHROPIC_API_KEY` set in Cloudflare Pages env (+ local `web/.dev.vars`). `USMLE_AI_MODEL` left at default `claude-opus-4-8`. FSRS/review/manual cards work without it.
- [x] P2: topic tracker tree (inline status editing) + weighted coverage % + weakness view. *(`PATCH /api/usmle/topics/[id]/progress`; `GET /api/usmle/stats/coverage` → `lib/usmle/coverage.ts` pure scorer, aggregates by top-level node; `app/usmle/topics/page.tsx` shows overall weighted coverage, "where to focus" ranking, per-system bars + card counts, per-subtopic status dropdowns.)*
- [x] P3 (partial): **cloze cards** (`components/usmle/Cloze.tsx` renderer — `{{c1::answer}}` / `::hint` syntax; ReviewSession renders hidden→revealed; manual composer has basic/cloze toggle) + **source/discipline tagging** (tags input in manual composer; AI already tags). ~~Anki `.apkg` import~~ dropped per user. FSRS param optimization deferred until enough `review_log` history accrues.
- [x] P4: study planner ("Today" panel) + practice-score logging. *(`components/usmle/TodayPanel.tsx` on the dashboard = due cards + weakest topics + latest NBME readiness, composed client-side from queue/coverage/scores endpoints. `GET`/`POST /api/usmle/scores` + `app/usmle/scores/page.tsx` log form + history for UWorld/NBME/Free120. "Scores" nav link added.)* Missed-Q → card pipeline already exists via AI generation's `missedConcept` input (P1).
- [ ] P5 (stretch): vignette practice + exam simulator.

---

## 11. Decisions Log (append as decisions are made)

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-21 | App lives as a **new Next.js section in this repo** (`web/app/usmle/`). | User choice; reuse proven edge/Cloudflare patterns. |
| 2026-06-21 | **Single-user**, no real auth (localStorage pointer + write key). | User choice; keep it simple. |
| 2026-06-21 | **FSRS** is the SRS engine (via `ts-fsrs`), not SM-2. | Modern, self-tuning, ~20–30% fewer reviews for equal retention. |
| 2026-06-21 | Flashcards MVP = **FSRS + manual + AI generation**; Anki import & cloze are fast-follow. | Differentiator is AI + topic integration, not replacing Anki's engine; `.apkg` parsing is non-trivial on edge. |
| 2026-06-21 | Storage = **Cloudflare D1** (provisional). | Relational, write-heavy SRS workload; KV/Sheets are poor fits. |
| 2026-06-21 | Topic taxonomy modeled on **Organ Systems** primary axis, Discipline + Task as facets. | Matches how NBME builds forms; aligns progress %, analytics, AI gen. |

| 2026-06-21 | **D1 from day one** (no KV-blob detour). | Avoids a later migration; SRS workload is relational from the start. |
| 2026-06-21 | **Taxonomy depth = First-Aid section level** (System → subsection). | The granularity Step 1 students actually track by; leaf diseases deepened later as a living taxonomy. |
| 2026-06-21 | **Include score tracking** (`practice_scores` table built in P0; UI surfaced ~P4). | User wants both flashcards + topic coverage + UWorld/NBME score history. |
| 2026-06-21 | **No external imports for now** — student/AI-authored cards only; no AnKing/copyrighted redistribution. | User confirmed. Anki `.apkg` import deferred / may stay out entirely. |
| 2026-06-22 | **FSRS via `ts-fsrs` 5.4.1** (zero-dep, edge-safe); target retention 0.90. | Don't hand-roll the math; library is pure functions, works on Cloudflare edge. |
| 2026-06-22 | **AI generation uses raw `fetch` to the Anthropic Messages API** (no SDK), default model `claude-opus-4-8`, structured-output JSON + adaptive thinking, human approval queue. | Matches repo's edge/Web-Crypto/fetch convention; `claude-opus-4-8` is the documented default; cost lever exposed via `USMLE_AI_MODEL` env. Generated cards never auto-save. |
| 2026-06-22 | ~~Mutations require the write key~~ → **superseded 2026-06-22: USMLE mutations are OPEN (no key)**. `isAuthorized()` returns `true`, decoupled from the project-wide `WRITE_KEY` (which the 4-Week Challenge uses). | User opted out of managing a key for a single-user app. ⚠️ Consequence: `POST /api/usmle/ai/generate-cards` is publicly callable and spends Anthropic credits — mitigate with an **Anthropic Console spend cap**; re-lock later via a dedicated `USMLE_WRITE_KEY` (see code comment in `lib/usmle/ids.ts`). |
| 2026-06-22 | **Coverage aggregates by top-level taxonomy node**, not the shared `organ_system` label; status→fraction (not_started 0 / learning .34 / reviewed .67 / confident 1); overall = exam-weight-weighted avg; weakness = `examWeight × (1 − coverage)`. | Node-level matches the tree and avoids collapsing Endocrine+Reproductive (both "Reproductive & Endocrine"). Weights are relative priorities, so the headline is labeled "weighted coverage," not a literal exam %. |
| 2026-06-22 | **Study planner is composed client-side** from existing endpoints (queue + coverage + scores) — no dedicated planner endpoint/table. | Avoids a new aggregation surface; the "Today" panel just joins three reads. Revisit if the plan grows richer (scheduling beyond "due now"). |

### Open questions (resolve in future chats)
1. **AI model + budget:** which Claude model for bulk card gen vs. quality, and rough monthly API cost ceiling? *(Decide at start of P1.)*
2. **Reconcile taxonomy** against the official usmle.org outline PDF before P2 analytics depend on weights.
3. **Anki import:** confirmed out for now — revisit only if the student later wants to bring their own legally-owned decks.

---

## 12. References (verify against primary source before seeding)
- USMLE Step 1 content outline & specifications — https://www.usmle.org/exam-resources/step-1-materials/step-1-content-outline-and-specifications
- USMLE Step 1 exam content / format — https://www.usmle.org/step-exams/step-1
- 2026 format change (May 14) overview — https://www.lecturio.com/blog/2026-usmle-changes-step-1-2-ck-software-block-updates/
- FSRS vs SM-2 — https://www.neurako.com/blog/fsrs-vs-sm2-spaced-repetition-algorithms-compared ; open-spaced-repetition (`ts-fsrs`, `fsrs-optimizer`) on GitHub
- Resource landscape 2026 — https://www.oraai.com/blog/best-usmle-step-1-resources ; https://thematchguy.com/usmle-step-1-guide-resources-study-tips-plan-schedule-how-to-study/

> ⚠️ Weightings in §3 are from secondary summaries of the official outline. **Before seeding the taxonomy, pull the official PDF from usmle.org** and mirror its exact node names and current percentages.

---

*End of v1. Update this doc as decisions land — it is the shared brain for every future chat on this project.*
