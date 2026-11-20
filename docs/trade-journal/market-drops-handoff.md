# Anatomy of a Drop (market-drops study): handoff

**State on 2026-11-20:** built, committed and live. Data to the 20 Nov 2026 close. A historical study, not advice;
nothing in it is a rule, and only the trader puts rules in force.

- **Live:** https://tapereader.us/studies/market-drops/ (23 static pages, interactive charts; `noindex`, not linked from the site's menus)
- **Code:** `scripts/marketdrops/` (**README.md there is the resume point**: file map, pipeline, gotchas)
- **Built site:** `web/public/studies/market-drops/` (committed; Cloudflare deploys it with the site)
- **Data and results:** `scripts/marketdrops/.data/` (git-ignored, about 150 MB; rebuilt by `run.js`)
- **Research notes with sources:** `scripts/marketdrops/research/*.md` (also on the site's Sources page)
- **Vault:** one summary note, `Market/Market Drops/00 Anatomy of a Drop.md`, linking to the site

## What was asked (20 Nov 2026)

Compare the present drop with 2018 on technicals and fundamentals; go beyond 2018 (2000, 2007 and other drops); what
fell most, what defied the drop, what turned before the index, what led after; what failed bounces and the real turn
looked like; signs of bottoming (VIX, volume, breadth); reaction to news; leverage then and now; whether a moving
average or something else would have been a better filter for longs; what worked intraday; daily and weekly charts to
train the eye, in the trader's colours (white/black candles on every timeframe, EMA 9/20, SMA 50/200). No strategy
back-tests. Depth and documentation matter equally; repetition that helps understanding is welcome. An HTML site on
tapereader.us was chosen over the vault for its charts.

## Main findings (numbers as of the build; the pages carry the tables)

1. A 10% fall has been a fork: of 35 earlier ones, 16 ended before −15% and 11 went to −20% or more.
2. The look-alike chart is weak evidence: from the peak, 2018 ranks 53rd of 95 as a match; look-alikes had no forecasting value.
3. On the macro numbers the October 2026 peak is closest to September 2018; March 2000 ranks third.
4. What is falling is unlike 2018 and like early 2000: the median large stock is about flat, half of stocks are up, the previous
   leaders are down a fifth and semiconductors more than 40% from their June high.
5. What ended 2018 is weaker now: inflation gave the Fed room then (2%, falling) and does not now (3.7–3.9%, rising);
   valuation and margin-debt growth are far higher.
6. A pop is not a low: 91 failed rallies against 35 real lows looked the same in their first five sessions. Breadth and
   persistence separated them; a follow-through day came after 58% of the failures too.
7. Proof costs part of the move: back above the 50-day a median 7% off the low, above the 200-day 10% (17–39% in V lows).
8. December 2018 gave no retest; the stages of proof took three weeks.
9. At every deep low since 1999 fewer than 21% of stocks were above their 200-day average; on 20 Nov 2026 it was 41%.
10. In 2018 the whole fall came in regular hours (gap-ups sold two times in three) and flipped at the low; 2026 has the same signature so far.
11. Shelters (staples, utilities, health care) lagged after every low; groups whose relative strength bottomed early led.
12. The profitable giants of 2000 (Cisco, Microsoft, Intel, Oracle) fell 60–90% and took 15–25 years to regain their highs.

## Runbook

```
cd tapereader-app
node scripts/marketdrops/run.js              # after the US close: download, analyse, build   (--no-fetch to rebuild only)
node scripts/marketdrops/run.js --intraday   # also refresh the 30-minute bars (never 09:15–16:15 New York time)
node scripts/marketdrops/serve.js            # look at it: http://localhost:4173/
bash scripts/marketdrops/publish.sh          # copy code + built site into the worktree ~/tapereader-worktrees/marketdrops
cd ~/tapereader-worktrees/marketdrops && git add -A scripts/marketdrops web/public/studies docs/trade-journal/market-drops-handoff.md
git commit -m "..." && git push origin market-drops-study:main      # Cloudflare deploys in a few minutes
```

The main checkout stays on its own branch; the study's files are untracked there and tracked on `main` (same pattern as
other studies). Do not stash, reset or switch branches in the main checkout.

## Pending decisions (the trader's)

1. Whether to refresh the study daily or weekly while the drop runs (not scheduled). The narrative sections about the
   present (`site/content/now-*.html`, `site/events/2026.json`) are hand-written and need a new research pass to stay current.
2. Whether to link the study from the site (it is reachable only by its address) or from the vault's root `00 Home.md`.
3. The condensed version for a blog or X thread: not written. `index.html` (findings) and `compare.html` are the natural base.
4. Whether any finding should feed the rulebook or the exposure-ladder proposal. The study proposes nothing.
5. Whether to buy older intraday data: the "what worked intraday" question is answered from daily bars before 2024.

## Lessons for the next model

- The trader wants black-and-white candles on **every** timeframe now (20 Nov 2026), not red/white on daily.
- Research sub-agents share one web-search budget; four of them exhausted it within the first hour. Stagger them, or give each a cap.
- Have the research agent that gathered the facts also write the narrative fragment, against computed fact sheets; it keeps
  the main context small and the numbers consistent.
- A published page must work whether or not the address has a trailing slash: every page carries `<base href>`.
