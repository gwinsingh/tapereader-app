"use client";

// Tiny hand-written markdown renderer for the Morning Brief (Obsidian flavour).
// Builds React elements only — never dangerouslySetInnerHTML — so any HTML in
// the source renders as literal text. Supported subset: ATX headings, **bold**,
// _italic_ / *italic*, ~~strike~~, ==highlight==, `code`, fenced code, bullet /
// numbered / task lists (nested by indent), tables, blockquotes + Obsidian
// callouts (`> [!note] Title`), horizontal rules, [links](url), wiki-links
// [[Page|label]] (plain text), embeds ![[file]] (muted note) and %% comments %%
// (stripped).

import React from "react";

const IMAGE_EXT = /\.(svg|png|jpe?g|gif|webp|bmp|avif)$/i;

const muted = { color: "var(--color-muted)" } as const;

// ── inline ───────────────────────────────────────────────────────────────────

const INLINE_RE = new RegExp(
  [
    "(`[^`]+`)", // 1 code
    "(!\\[\\[[^\\]]+\\]\\])", // 2 embed
    "(\\[\\[[^\\]]+\\]\\])", // 3 wiki-link
    "(!\\[[^\\]]*\\]\\([^)]*\\))", // 4 md image
    "(\\[[^\\]]+\\]\\([^)\\s]+(?:\\s+\"[^\"]*\")?\\))", // 5 md link
    "(\\*\\*[^*]+?\\*\\*|__[^_]+?__)", // 6 bold
    "(~~[^~]+?~~)", // 7 strike
    "(==[^=]+?==)", // 8 highlight
    "(\\*[^*\\s](?:[^*]*?[^*\\s])?\\*|_[^_\\s](?:[^_]*?[^_\\s])?_(?![\\w]))", // 9 italic (no lookbehind — older iOS Safari)
  ].join("|"),
  "g"
);

function wikiLabel(inner: string): string {
  const [target, label] = inner.split("|");
  if (label && label.trim()) return label.trim();
  const page = (target || "").split("/").pop() || "";
  return page.replace(/#\^?/g, " › ").replace(/\.md$/i, "").trim();
}

function safeHref(url: string): string | null {
  const u = url.trim();
  return /^(https?:|mailto:)/i.test(u) ? u : null;
}

export function renderInline(text: string, keyPrefix = "i"): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let n = 0;
  const re = new RegExp(INLINE_RE.source, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const tok = m[0];
    // `_italic_` must not start inside a word (snake_case) — checked here
    // instead of with a regex lookbehind.
    if (m[9] && tok[0] === "_" && m.index > 0 && /\w/.test(text[m.index - 1])) {
      re.lastIndex = m.index + 1;
      continue;
    }
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${keyPrefix}-${n++}`;
    if (m[1]) {
      out.push(
        <code
          key={k}
          className="rounded px-1 py-px font-mono text-[0.85em]"
          style={{ backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)" }}
        >
          {tok.slice(1, -1)}
        </code>
      );
    } else if (m[2]) {
      const inner = tok.slice(3, -2).split("|")[0].trim();
      out.push(
        <span key={k} className="text-xs italic" style={muted}>
          {IMAGE_EXT.test(inner) ? "(chart in vault)" : `(embedded in vault: ${wikiLabel(inner)})`}
        </span>
      );
    } else if (m[3]) {
      out.push(<span key={k}>{wikiLabel(tok.slice(2, -2))}</span>);
    } else if (m[4]) {
      const alt = tok.slice(2, tok.indexOf("]"));
      out.push(
        <span key={k} className="text-xs italic" style={muted}>
          {alt ? `(image: ${alt})` : "(image in vault)"}
        </span>
      );
    } else if (m[5]) {
      const close = tok.indexOf("](");
      const label = tok.slice(1, close);
      const url = tok.slice(close + 2, -1).replace(/\s+"[^"]*"$/, "");
      const href = safeHref(url);
      out.push(
        href ? (
          <a
            key={k}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
            style={{ color: "var(--color-accent)" }}
          >
            {renderInline(label, k)}
          </a>
        ) : (
          <span key={k}>{renderInline(label, k)}</span>
        )
      );
    } else if (m[6]) {
      out.push(<strong key={k}>{renderInline(tok.slice(2, -2), k)}</strong>);
    } else if (m[7]) {
      out.push(<s key={k}>{renderInline(tok.slice(2, -2), k)}</s>);
    } else if (m[8]) {
      out.push(
        <mark
          key={k}
          className="rounded px-0.5"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-warn, #d97706) 25%, transparent)",
            color: "inherit",
          }}
        >
          {renderInline(tok.slice(2, -2), k)}
        </mark>
      );
    } else if (m[9]) {
      out.push(<em key={k}>{renderInline(tok.slice(1, -1), k)}</em>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// ── blocks ───────────────────────────────────────────────────────────────────

const HEADING_RE = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const LIST_RE = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const HR_RE = /^\s*([-*_])(\s*\1){2,}\s*$/;
const FENCE_RE = /^\s*(```|~~~)/;
const EMBED_ONLY_RE = /^\s*!\[\[[^\]]+\]\]\s*$/;
// Separator row: only pipes, dashes, colons, spaces — with at least one pipe and dash.
const TABLE_SEP_RE = /^(?=[^|]*\|)(?=[^-]*-)[\s|:-]+$/;

function stripComments(md: string): string {
  return md.replace(/%%[\s\S]*?%%/g, "").replace(/%%[\s\S]*$/, "");
}

function indentWidth(s: string): number {
  return s.replace(/\t/g, "    ").length;
}

function splitRow(line: string): string[] {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|") && !s.endsWith("\\|")) s = s.slice(0, -1);
  // Split on unescaped pipes; a pipe inside [[wiki|label]] is not a cell break.
  const cells: string[] = [];
  let cur = "";
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "\\" && s[i + 1] === "|") { cur += "|"; i++; continue; }
    if (ch === "[" && s[i + 1] === "[") { depth++; cur += "[["; i++; continue; }
    if (ch === "]" && s[i + 1] === "]" && depth > 0) { depth--; cur += "]]"; i++; continue; }
    if (ch === "|" && depth === 0) { cells.push(cur.trim()); cur = ""; continue; }
    cur += ch;
  }
  cells.push(cur.trim());
  return cells;
}

interface ListItem {
  text: string;
  children: string[]; // raw lines nested under this item (re-parsed as blocks)
}

function parseList(lines: string[], start: number): { end: number; ordered: boolean; items: ListItem[]; startNum: number } {
  const first = lines[start].match(LIST_RE)!;
  const baseIndent = indentWidth(first[1]);
  const ordered = /\d/.test(first[2]);
  const startNum = ordered ? parseInt(first[2], 10) || 1 : 1;
  const items: ListItem[] = [];
  let i = start;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      // Blank line: continue the list only if the next non-blank line is still part of it.
      let j = i + 1;
      while (j < lines.length && !lines[j].trim()) j++;
      if (j < lines.length) {
        const nm = lines[j].match(LIST_RE);
        if ((nm && indentWidth(nm[1]) >= baseIndent) || (indentWidth(lines[j].match(/^\s*/)![0]) > baseIndent && items.length)) {
          i = j;
          continue;
        }
      }
      break;
    }
    const lm = line.match(LIST_RE);
    const ind = indentWidth(line.match(/^\s*/)![0]);
    if (lm && ind <= baseIndent + 1) {
      if (ind < baseIndent) break;
      items.push({ text: lm[3], children: [] });
      i++;
      continue;
    }
    if (ind > baseIndent && items.length) {
      items[items.length - 1].children.push(line);
      i++;
      continue;
    }
    // Lazy continuation of the previous item's text.
    if (items.length && !lm && !HEADING_RE.test(line) && !line.trim().startsWith(">") && !line.trim().startsWith("|")) {
      items[items.length - 1].text += " " + line.trim();
      i++;
      continue;
    }
    break;
  }
  return { end: i, ordered, items, startNum };
}

function dedent(lines: string[]): string[] {
  const widths = lines.filter((l) => l.trim()).map((l) => l.match(/^\s*/)![0].length);
  const min = widths.length ? Math.min(...widths) : 0;
  return lines.map((l) => l.slice(Math.min(min, l.match(/^\s*/)![0].length)));
}

const CALLOUT_RE = /^\[!([\w-]+)\]([+-]?)\s*(.*)$/;

function calloutColor(type: string): string {
  const t = type.toLowerCase();
  if (["warning", "caution", "attention", "danger", "error", "bug", "failure", "fail", "missing"].includes(t))
    return "var(--color-danger)";
  if (["tip", "hint", "important", "success", "check", "done"].includes(t)) return "var(--color-accent)";
  return "var(--color-border)";
}

function renderBlocks(lines: string[], keyPrefix: string, depth = 0): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let i = 0;
  let n = 0;
  const key = () => `${keyPrefix}-${n++}`;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    // Fenced code
    const fence = line.match(FENCE_RE);
    if (fence) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(fence[1])) body.push(lines[i++]);
      i++; // closing fence
      out.push(
        <pre
          key={key()}
          className="overflow-x-auto rounded border p-2 font-mono text-xs"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
        >
          {body.join("\n")}
        </pre>
      );
      continue;
    }

    // Heading
    const h = line.match(HEADING_RE);
    if (h) {
      const level = h[1].length;
      const cls =
        level <= 2
          ? "mt-3 text-[15px] font-bold"
          : level === 3
            ? "mt-2.5 text-sm font-semibold"
            : "mt-2 text-xs font-semibold uppercase tracking-wide";
      out.push(
        <div key={key()} className={cls} role="heading" aria-level={Math.min(level + 2, 6)}>
          {renderInline(h[2], keyPrefix + "h" + n)}
        </div>
      );
      i++;
      continue;
    }

    // Horizontal rule (checked before lists: "- - -" / "***")
    if (HR_RE.test(line)) {
      out.push(<hr key={key()} className="my-2" style={{ borderColor: "var(--color-border)" }} />);
      i++;
      continue;
    }

    // Embed on its own line
    if (EMBED_ONLY_RE.test(line)) {
      out.push(<p key={key()}>{renderInline(line.trim(), keyPrefix + "e" + n)}</p>);
      i++;
      continue;
    }

    // Blockquote / callout
    if (line.trim().startsWith(">")) {
      const body: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        body.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      const cm = body[0]?.match(CALLOUT_RE);
      if (cm) {
        const type = cm[1];
        const title = cm[3] || type.charAt(0).toUpperCase() + type.slice(1);
        // Obsidian fold marker: "[!x]-" = closed by default, "[!x]+" = open but foldable. The vault puts
        // experimental material (study charts, pattern pictures, research drafts) in closed "example" callouts.
        if (cm[2] && body.length > 1) {
          out.push(
            <details
              key={key()}
              open={cm[2] === "+"}
              className="rounded-md border px-3 py-2"
              style={{ borderColor: calloutColor(type), borderLeftWidth: 3, backgroundColor: "var(--color-bg)" }}
            >
              <summary className="cursor-pointer text-xs font-semibold" style={{ color: "var(--color-text)" }}>
                {renderInline(title, keyPrefix + "ct" + n)}
                {type.toLowerCase() === "example" && (
                  <span
                    className="ml-2 rounded border px-1 py-px text-[10px] font-normal uppercase tracking-wide"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
                  >
                    experimental
                  </span>
                )}
              </summary>
              <div className="mt-1 space-y-1.5">{renderBlocks(body.slice(1), keyPrefix + "c" + n, depth + 1)}</div>
            </details>
          );
          continue;
        }
        out.push(
          <div
            key={key()}
            className="rounded-md border px-3 py-2"
            style={{
              borderColor: calloutColor(type),
              borderLeftWidth: 3,
              backgroundColor: "var(--color-bg)",
            }}
          >
            <div className="text-xs font-semibold" style={{ color: "var(--color-text)" }}>
              {renderInline(title, keyPrefix + "ct" + n)}
            </div>
            {body.length > 1 && (
              <div className="mt-1 space-y-1.5">{renderBlocks(body.slice(1), keyPrefix + "c" + n, depth + 1)}</div>
            )}
          </div>
        );
      } else {
        out.push(
          <blockquote
            key={key()}
            className="space-y-1.5 border-l-2 pl-3"
            style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
          >
            {renderBlocks(body, keyPrefix + "q" + n, depth + 1)}
          </blockquote>
        );
      }
      continue;
    }

    // Table: a pipe row followed by a separator row
    if (line.trim().startsWith("|") && i + 1 < lines.length && TABLE_SEP_RE.test(lines[i + 1])) {
      const head = splitRow(line);
      const align = splitRow(lines[i + 1]).map((c) =>
        c.endsWith(":") ? (c.startsWith(":") ? "center" : "right") : "left"
      ) as ("left" | "center" | "right")[];
      i += 2;
      const body: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) body.push(splitRow(lines[i++]));
      const tk = key();
      out.push(
        <div key={tk} className="max-w-full overflow-x-auto">
          <table className="w-max min-w-full border-collapse text-xs">
            <thead>
              <tr>
                {head.map((c, ci) => (
                  <th
                    key={ci}
                    className="border px-2 py-1 font-semibold"
                    style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)", textAlign: align[ci] || "left" }}
                  >
                    {renderInline(c, `${tk}-h${ci}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri}>
                  {head.map((_, ci) => (
                    <td
                      key={ci}
                      className="border px-2 py-1 align-top"
                      style={{ borderColor: "var(--color-border)", textAlign: align[ci] || "left" }}
                    >
                      {renderInline(r[ci] ?? "", `${tk}-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // List
    if (LIST_RE.test(line)) {
      const { end, ordered, items, startNum } = parseList(lines, i);
      i = end;
      const lk = key();
      const children = items.map((it, ii) => {
        const task = it.text.match(/^\[([ xX/-])\]\s+(.*)$/);
        const content = task ? task[2] : it.text;
        const done = task && task[1].trim() !== "";
        return (
          <li key={ii} className="pl-0.5">
            {task && (
              <span className="mr-1" style={muted} aria-hidden>
                {done ? "☑" : "☐"}
              </span>
            )}
            <span style={done ? { textDecoration: "line-through", color: "var(--color-muted)" } : undefined}>
              {renderInline(content, `${lk}-${ii}`)}
            </span>
            {it.children.length > 0 && (
              <div className="mt-1 space-y-1">{renderBlocks(dedent(it.children), `${lk}-${ii}c`, depth + 1)}</div>
            )}
          </li>
        );
      });
      out.push(
        ordered ? (
          <ol key={lk} start={startNum} className="list-decimal space-y-0.5 pl-5">
            {children}
          </ol>
        ) : (
          <ul key={lk} className={`${depth % 2 ? "list-[circle]" : "list-disc"} space-y-0.5 pl-5`}>
            {children}
          </ul>
        )
      );
      continue;
    }

    // Paragraph: consecutive plain lines, Obsidian-style soft line breaks kept.
    const para: string[] = [];
    while (i < lines.length) {
      const l = lines[i];
      if (
        !l.trim() ||
        HEADING_RE.test(l) ||
        LIST_RE.test(l) ||
        FENCE_RE.test(l) ||
        HR_RE.test(l) ||
        EMBED_ONLY_RE.test(l) ||
        l.trim().startsWith(">") ||
        (l.trim().startsWith("|") && i + 1 < lines.length && TABLE_SEP_RE.test(lines[i + 1]))
      ) {
        if (para.length === 0 && !l.trim()) i++;
        if (para.length === 0 && l.trim()) {
          // A line we could not classify differently — take it as text to guarantee progress.
          para.push(l);
          i++;
        }
        break;
      }
      para.push(l);
      i++;
    }
    const pk = key();
    out.push(
      <p key={pk}>
        {para.map((l, li) => (
          <React.Fragment key={li}>
            {li > 0 && <br />}
            {renderInline(l.trim(), `${pk}-${li}`)}
          </React.Fragment>
        ))}
      </p>
    );
  }
  return out;
}

export default function BriefMarkdown({ markdown }: { markdown: string }) {
  const lines = stripComments(markdown || "").replace(/\r\n?/g, "\n").split("\n");
  return <div className="space-y-2 text-sm leading-relaxed break-words">{renderBlocks(lines, "md")}</div>;
}
