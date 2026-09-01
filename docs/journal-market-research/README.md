# Trading Journal — Market Research

**Status:** research in progress · Started 2026-09-01

An in-depth study of the commercial trading-journal market, run to answer two
linked questions:

1. **What should we build into our own journal next?** (primary)
2. **What would it take to build a competitor worth selling?** (secondary, but
   taken seriously — the answer might be "don't", and that is a valid finding.)

Read [`00-method.md`](00-method.md) first — it defines the scope, the three
analytical personas, and the `[V]`/`[R]`/`[I]` confidence tags used throughout.

## Read in this order

| # | Doc | What it answers |
|---|---|---|
| 0 | [Method](00-method.md) | How this was researched and how much to trust it |
| 1 | [Landscape](01-landscape.md) | Who is in this market, what they charge, where the empty spaces are |
| 2 | [Feature matrix](02-feature-matrix.md) | **The core artifact.** Every feature × every vendor × us |
| 3 | [Gap analysis](03-gap-analysis.md) | What we already have, what we lack, what only we do |
| 4 | [Product thesis](04-product-thesis.md) | PM: which segment, what wedge, what moat, what price |
| 5 | [Build plan](05-build-plan.md) | Engineer: what it costs to build and run on our stack |
| 6 | [Dogfood backlog](06-dogfood-backlog.md) | **The actionable output.** What to build into our journal now |
| 7 | [Open questions](07-open-questions.md) | What we could not settle, and how to settle it |

Per-vendor detail lives in [`vendors/`](vendors/). Files prefixed `_` are
thematic rather than single-vendor (adjacent categories, AI, business model,
voice-of-customer).

A rendered, human-readable version of the whole thing is at
[`report/index.html`](report/index.html) — open it directly in a browser, it is
self-contained with no build step.

## Ground rules used

- **Public sources only.** No trial accounts were created and no credentials
  were entered anywhere. Everything here comes from vendor sites, docs,
  changelogs, pricing pages, demos, forums, and reviews.
- **Claims are tagged.** `[V]` verified on the vendor's own material,
  `[R]` reported by third parties, `[I]` our inference. Pricing and features in
  this category change fast — check the `as-of` date on any file before acting
  on it.
- **Marketing is not evidence.** Where a vendor's claim and user reports
  disagree, both are recorded and the disagreement is noted.
