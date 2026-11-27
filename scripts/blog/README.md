# The blog (TapeReader Research Notes)

Dated research notes at **https://tapereader.us/blog**. Posts are Markdown files; a small build script turns them into
static pages with charts, tags, a series map and an RSS feed. The same Markdown is written into the Obsidian vault as
text. No install step: plain Node, the Markdown parser is in `vendor/`.

## Resume here

```
cd tapereader-app
node scripts/blog/new.js "Title of the note" research technical   # start a post (draft: true)
node scripts/blog/build.js --drafts                               # build, drafts included (--loose: build despite problems, preview only)
node scripts/blog/serve.js                                        # look at it: http://localhost:4174/blog
node scripts/blog/build.js                                        # build for publishing (drafts left out)
bash scripts/blog/publish.sh                                      # copy into the worktree ~/tapereader-worktrees/blog
cd ~/tapereader-worktrees/blog && git add -A scripts/blog web/public/blog web/lib/blog-latest.json
git commit -m "Blog: <what changed>" && git push origin blog:main # Cloudflare deploys in a few minutes
node scripts/blog/vault.js                                        # full text into the vault (posts with a vault: line)
node scripts/vault-sync/check.js --push                           # until it prints "in sync" (Obsidian must be open)
```

The main checkout stays on its own branch; `scripts/blog/` and `web/public/blog/` are untracked there and tracked on
`main` through the worktree (the same pattern as the market-drops study). Do not stash, reset or switch branches in the
main checkout.

## Writing a post

A post is `posts/YYYY-MM-DD-some-slug.md`. The slug is its address: `/blog/some-slug`.

```
---
title: "Title of the note"
date: 2026-11-23
tags: [research, technical]          # every tag must be described in site.json
summary: One sentence that states the main point.
series: investor-styles              # a series from site.json (the post then sits in that series' collection)
collection: reading-notes            # for a post outside a series: the collection it sits in (ids in site.json)
short: Options primer                # optional: a short name for lists (default: the title up to its first colon)
vault: Studies/30 Investor Styles/20 Profiles/Some Name   # optional: also write the full text into the vault
link: /studies/market-drops          # optional: the post introduces a multi-page study and links to it
updated: 2026-12-01                  # optional
draft: true                          # optional: built only with --drafts
---
```

Body: ordinary Markdown (headings from `##`, tables, lists, links). Two additions:

**Callouts** (the same syntax works in Obsidian). Types: `take`, `warn`, `define`, `test`.

```
> [!take] What to take from it
> - First point.
```

**Figures**: a fenced block named `figure` holding JSON. Every figure takes `title`, and optionally `sub`, `note`,
`source`, `sourceUrl`. Text fields accept `**bold**`.

| kind | fields |
|---|---|
| `bar` | `x` [labels], `series` [{name, values}] (1 to 3), `unit`, `sign: true` colours negatives red (one series) |
| `hbar` | `rows` [[label, value, small note?]], `unit`, `highlight` [labels], `sign` |
| `line` | `x` [labels], `series` [{name, values, dash?}] (1 to 4; `null` breaks a line), `unit`, `marks` [[x label, text]], `zero: false` |
| `stack` | `parts` [[name, value]] or `bars` [{name, parts}], `unit` |
| `timeline` | `events` [[when, title, text?]] |
| `flow` | `steps` [[title, text?]], `dir: "h"` for up to 5 steps side by side |
| `compare` | `cols` [{title, tag?, items[]}] |
| `quadrant` | `xAxis` [left, right], `yAxis` [top, bottom], `cells` [TL, TR, BL, BR] each [title, text] |
| `tiles` | `tiles` [[value, label, small note?]] |
| `tape` | Candles and lines on one clock, in stacked panels with one crosshair. `x` [label per bar], `ticks` [[index, label]], `sessions` [[start index, name]], `panels` [{name, desc, unit, height, `candles` [[o,h,l,c]], `lines` [{name, values, c, area}], `levels` [[value, text]], min, max}], `marks` [[index, "buy"/"sell"/"note", text, when?]] (lettered badges with a key under the chart) |
| `scatter` | `points` [[x, y, group, label?]], `groups` [names], `xName`, `yName`, `xUnit`, `yUnit`, `reverseX`, `notes` [[x, y, text, "l"?]] |
| `explorer` | An option pricer with three sliders (Black-Scholes). `type` call/put, `strike`, `contracts`, `cost`, `underlying`, `price` {min, max, value}, `days` {max, value}, `iv` {min, max, value}, `presets` [[label, price, days, iv]], `ymax` |

`line` also takes `log: true` (log scale) and `points: true` (a dot on every value); `bar` and `hbar` take `dp` (decimals in labels).

`unit` examples: `"%"`, `"$bn"`, `"x"`. Charts carry a hover read-out and a "Show the numbers" table. In the vault each
figure becomes its title and a table.

## Collections (the shelf on the home page)

The home page is a shelf: one card per collection, then a short "Latest" list with one line per collection and day.
Every published post sits in exactly one collection, and the build stops if one has none. Collections are listed in
`site.json` under `collections`, in shelf order. A collection is either a series (`{ "id", "series" }`; its page is the
series map at `/blog/series/<id>`) or a plain list (`{ "id", "title", "summary" }`; its page is
`/blog/collections/<id>`, and posts join it with `collection: <id>`). A new topic needs one new entry there; a
collection with no posts is not shown. `/blog/archive` keeps the full dated list with the tag filter. Post addresses do
not depend on the collection, so a post can be moved without breaking links. Vault folders so far: `Studies/30 Investor
Styles`, `Studies/40 Options`, `Studies/50 Reading Notes`.

## Rules for anything published here

- **Public site.** No personal details, accounts, positions or trades. Write in the third person and in general terms
  ("this fits 5-minute opening range breakout strategies"), never "you" or "your".
- **Research, not advice.** Describe what happened and how often. Word ideas as observations or as tests.
- **A layman must be able to follow it.** Define each term the first time, in a few plain words in brackets. Repeat key
  numbers in a figure when a picture helps.
- **Every number has a source, a date and a unit.** Cite inline, right after the claim. Mark what could not be confirmed.
- **Copyright:** paraphrase; at most one short quotation (under 15 words) per source.
- Search engines are asked not to index the blog (`"index": false` in `site.json`). Set it to `true` to allow indexing.

## Files

| File | What it does |
|---|---|
| `site.json` | Title, texts, the tag list with descriptions, the series list, the collections (the shelf), `index` (search engines) |
| `series/*.json` | A series: groups, members, primers, reading order, vault folder |
| `posts/*.md` | The posts |
| `build.js` | Markdown → pages in `web/public/blog/`, plus `web/lib/blog-latest.json` for the home page. Stops on broken links, bad figures, unknown tags |
| `lib/figures.js` | The figure kinds: HTML for the site, tables for the vault |
| `lib/posts.js` | Front matter, post loading, series order |
| `site/assets/` | `blog.css` (theme, light and dark), `blog.js` (theme switch, tag filter, chart read-outs) |
| `site/img/` | Images for posts, served at `/blog/img/` (keep them small; none so far) |
| `vault.js` | Full text of posts into the vault; keeps everything under the ✍️ marker |
| `serve.js`, `new.js`, `publish.sh` | Preview, new post, copy to the deployment worktree |
| `research/options/` | The two options posts (27 Nov 2026): post templates with `{{figure}}` placeholders, `blogfigs.py` (builds the chart blocks from Yahoo chart data fetched with `fetch.py` into `data/`, not kept in the repo) and `compile.py` (fills the templates into `posts/`). `cleanvol.py` repairs impossible 1-minute volumes before VWAP |
| `research/investor-styles/` | `PROTOCOL.md` (what every profile must find out) and, per name, a fact sheet and a draft |
| `vendor/marked.min.js` | The Markdown parser (marked 4.3.0, MIT) |

## How it is served

`web/next.config.mjs` (on `main`) maps `/blog` → `/blog/index.html`, `/blog/<slug>` → `/blog/<slug>.html`, and the same
for `/blog/tags/<tag>`, `/blog/series/<id>` and `/blog/collections/<id>` (`/blog/archive` is served by the slug rule). The home page shows the latest notes (`web/components/BlogSection.tsx`).

Studies with their own pages stay under `web/public/studies/` and get a dated post with a `link:`:
`/studies/market-drops` (built by `scripts/marketdrops`) and `/studies/ai-buildout-atlas` (a copy of `docs/` from the
private repository `gwinsingh/ai-buildout-atlas`; to refresh it, copy `docs/` again and run `publish.sh --studies`).

To test the Next side locally (home page, clean addresses), run the dev server bound to this laptop only, so Windows
does not raise a firewall prompt: `next dev -H 127.0.0.1 -p 3111`.

## The investor-styles series

**State on 2026-11-24:** 12 of 40 parts live (global macro: primer, Stan Druckenmiller, Ray Dalio; value: primer,
Warren Buffett, Peter Lynch; quant: primer, Jim Simons, Ken Griffin; activist and contrarian: the hedge fund primer,
Bill Ackman, Michael Burry) plus the method post. Next group: distressed debt (the credit primer, David Tepper), which
can be paired with thematic growth funds (the funds-and-ETFs primer, Cathie Wood) if two primers in one round are
acceptable. Lessons so far: tell research agents not to use the browser-pane tools (one sat for an hour on a
site-permission prompt) and to put `--max-time` on shell downloads; ask them to write the fact sheet early; tell them
which post owns a number that several posts mention, so the others only point to it; after the posts come back, check
that numbers shared between posts of a group agree (assets, returns, any calculated chart), recompute every calculated
chart, and fetch the source of any surprising recent claim. PDFs: the Read tool cannot open them on this machine; use
`pdftotext -layout`. Prices: the Yahoo chart endpoint answers `curl`; Stooq does not. Figure check: in the preview, hide
everything except `.fig` blocks and screenshot at 1000x1700, about three figures per shot. How the pilot was made: one research
agent per post, each given `PROTOCOL.md` and a list of the facts to pin down, capped at 60 web searches, no helpers;
each wrote `<slug>.facts.md` and `<slug>.draft.md`, then turned its own draft into the post with figure blocks; the
posts were then read in full and every figure checked in the browser before publishing. The ranking of all 30 is made
at the end from the six questions in the method post; the original joke tier list is dropped. `posts/2026-01-01-figure-test.md`
is a draft that shows every figure kind.

30 names in 13 style groups, 10 primers. State and reading order: `series/investor-styles.json` (a name counts as
published when a post with its slug exists). To add a name: research it against `research/investor-styles/PROTOCOL.md`
(fact sheet first), write `posts/<date>-<slug>.md` with `series: investor-styles` and a `vault:` path under
`Studies/30 Investor Styles/` (`10 Primers/` or `20 Profiles/`), build, publish, run `vault.js`.
