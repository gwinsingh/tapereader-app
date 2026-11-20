# Writing guide for the study "Anatomy of a Drop"

The study is a static website (many HTML pages with interactive charts). A build script assembles each page from
(a) charts and tables it computes from price data and (b) **narrative fragments**: HTML files in `site/content/`.
This guide is for whoever writes a fragment or an events file.

## The reader

One trader. Intelligent and experienced at reading charts, not an economist. Reads on a desktop and on an iPhone.
Wants to train the eye and the judgement, will go over the pages several times over many days, and may later publish
a shorter version. So:

- **No personal details of any kind** (no names of the trader, accounts, positions, "you sold", etc.).
- This is a **historical study, not advice.** Never say what to buy or sell, never "you should". Describe what
  happened, how often, and what was or was not visible at the time. A sentence that sounds like a rule must be worded
  as an observation ("in 9 of 13 cases …").
- Voice: impersonal and plain ("a trader watching this on 24 December saw …", "the index", "buyers"). No "we", no "you".

## How to write

- State the point first, then the evidence. Short sentences. Plain words. One idea per sentence.
- Define every term of art the first time it appears on a page, in a few words in brackets, e.g.
  "forward P/E (price divided by the next twelve months' expected earnings)". A glossary page exists; do not rely on it.
- Every number carries its unit, its date and what it measures. Prefer "fell 19.8% from 20 Sep to 24 Dec 2018" to "fell ~20%".
- Use the numbers in `site/facts/*.txt` (computed from daily price data by the build) for any index, sector, ETF or
  stock move, VIX level, breadth reading or count of rallies, so the pages agree with the charts. Use your research file
  for everything prices cannot give (events, causes, earnings, valuation, positioning, leverage, what people said).
  If the two disagree on a price fact, the facts file wins; if it matters, say that sources differ.
- Say plainly what is not known or could not be verified: `<span class="unv">not verified</span>`.
- Repetition across pages is welcome when it helps the reader; padding is not.
- Sources: link inline, right after the claim: `<a class="src" href="https://…" target="_blank" rel="noopener">FactSet, 21 Dec 2018</a>`.
  Only cite a source you actually used in your research file.
- No hype, no rhetorical questions, no metaphors that need decoding. Dry is fine.
- Typography: use the real characters − (minus), – (en dash for ranges), ’ and “ ” as needed; write percentages as −19.8% / +5.0%.

## Fragment format

One file per fragment: `site/content/<name>.html`, UTF-8, **HTML body content only** (no `<html>`, `<head>`, `<body>`, no `<style>`, no `<script>`).
A fragment is one or more `<section id="…">` blocks. Allowed elements and classes:

```html
<section id="short-id">
  <h2>Heading that states the point</h2>
  <p class="lead">Two or three sentences with the answer.</p>
  <h3>Sub-heading</h3>
  <p>…</p>
  <ul><li>…</li></ul>   <ol>…</ol>
  <div class="tiles"><div class="tile"><b>−19.8%</b><span>S&amp;P 500, 20 Sep → 24 Dec 2018</span></div> … </div>   <!-- 2–6 key numbers -->
  <table class="t"><thead><tr><th>…</th><th class="num">…</th></tr></thead><tbody><tr><td>…</td><td class="num neg">−4.4%</td></tr></tbody></table>
        <!-- class="num" right-aligns; add "pos" or "neg" to colour a signed number; wrap long tables: <div class="scroll">…</div> -->
  <div class="take"><b>What to take from it</b><ul><li>…</li></ul></div>      <!-- end most sections with this -->
  <div class="warn"><b>Limits</b> …</div>                                    <!-- caveats, small samples, hindsight -->
  <blockquote class="q">Short quotation (under 15 words) <cite>— who, date</cite></blockquote>   <!-- at most one or two per fragment -->
  <details><summary>Longer list or side note</summary> … </details>
  <!-- CHART: one line saying what chart would help here; the build script decides whether to add it -->
</section>
```

Do not draw charts, do not use images, do not use inline styles. Tables are welcome; keep them under 8 columns.
Do not copy source text: paraphrase; at most one short quotation (under 15 words) per source.

## Events file format

`site/events/<id>.json`: the key days the charts will mark with numbers. A JSON array, oldest first:

```json
[{ "d": "2018-10-03", "t": "Powell: rates “a long way from neutral”", "cat": "Fed",
   "how": "Stocks flat that day; yields jumped the next two days and the slide began a week later.", "src": "https://…" }]
```

- `d` must be a trading day (if the news came on a weekend or after the close, use the next session and say so in `how`).
- `t`: 70 characters at most, a headline a trader would recognise. `cat`: one of Fed, inflation, macro, oil, trade,
  earnings, AI, credit, politics, positioning, technical. `how`: one or two sentences on how the market took it.
- 25 to 45 events per file: the days that moved the market or changed the story, not every data release.
