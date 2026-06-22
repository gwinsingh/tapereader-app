"use client";

import React from "react";
import MermaidDiagram from "./MermaidDiagram";

// Minimal, dependency-free Markdown renderer that emits React elements (never
// dangerouslySetInnerHTML, so it's XSS-safe even for AI-authored content).
// Supports: # headings, **bold**, *italic*, `code`, ``` fences, - / 1. lists,
// > blockquotes, --- rules, [links](url), and GFM pipe tables. Good enough for
// the study-note format produced by lib/usmle/notes.ts.

const muted = { color: "var(--color-muted)" } as const;
const border = { borderColor: "var(--color-border)" } as const;

// ---- inline formatting -----------------------------------------------------
const INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/;

function renderInline(text: string, keyBase: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let rest = text;
  let i = 0;
  while (rest.length) {
    const m = INLINE.exec(rest);
    if (!m) { out.push(rest); break; }
    if (m.index > 0) out.push(rest.slice(0, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (tok.startsWith("`")) {
      out.push(
        <code key={key} className="rounded px-1 py-0.5 font-mono text-[0.85em]" style={{ backgroundColor: "var(--color-border)" }}>
          {tok.slice(1, -1)}
        </code>
      );
    } else if (tok.startsWith("**")) {
      out.push(<strong key={key}>{renderInline(tok.slice(2, -2), key)}</strong>);
    } else if (tok.startsWith("*")) {
      out.push(<em key={key}>{tok.slice(1, -1)}</em>);
    } else {
      const lm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok)!;
      out.push(
        <a key={key} href={lm[2]} target="_blank" rel="noreferrer" className="underline" style={{ color: "var(--color-accent)" }}>
          {lm[1]}
        </a>
      );
    }
    rest = rest.slice(m.index + tok.length);
  }
  return out;
}

// ---- block parsing ---------------------------------------------------------
function isTableSep(line: string): boolean {
  return /^\s*\|?[\s:|-]+\|?\s*$/.test(line) && line.includes("-") && line.includes("|");
}
function splitRow(line: string): string[] {
  return line.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((c) => c.trim());
}

export default function Markdown({ children }: { children: string }) {
  const lines = (children || "").replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  const k = () => `b${key++}`;

  while (i < lines.length) {
    const line = lines[i];

    // blank
    if (line.trim() === "") { i++; continue; }

    // fenced code (```mermaid renders a diagram; others render as code)
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim().toLowerCase();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) { buf.push(lines[i]); i++; }
      i++; // closing fence
      if (lang === "mermaid") {
        blocks.push(<MermaidDiagram key={k()} code={buf.join("\n")} />);
      } else {
        blocks.push(
          <pre key={k()} className="overflow-x-auto rounded border p-3 font-mono text-xs" style={{ ...border, backgroundColor: "var(--color-bg)" }}>
            <code>{buf.join("\n")}</code>
          </pre>
        );
      }
      continue;
    }

    // heading
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const cls = level <= 1 ? "mt-4 text-xl font-bold" : level === 2 ? "mt-4 text-base font-semibold" : "mt-3 text-sm font-semibold";
      blocks.push(
        <div key={k()} className={cls} style={level === 2 ? { color: "var(--color-accent)" } : undefined}>
          {renderInline(h[2], k())}
        </div>
      );
      i++;
      continue;
    }

    // horizontal rule
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      blocks.push(<hr key={k()} className="my-3" style={border} />);
      i++;
      continue;
    }

    // table
    if (line.includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const header = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") { rows.push(splitRow(lines[i])); i++; }
      blocks.push(
        <div key={k()} className="my-2 overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                {header.map((c, ci) => (
                  <th key={ci} className="border px-2 py-1 text-left font-semibold" style={border}>{renderInline(c, `${k()}h${ci}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, ci) => (
                    <td key={ci} className="border px-2 py-1 align-top" style={border}>{renderInline(c, `r${ri}c${ci}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // blockquote
    if (/^\s*>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^\s*>\s?/, "")); i++; }
      blocks.push(
        <blockquote key={k()} className="my-2 border-l-2 pl-3 text-sm italic" style={{ ...border, ...muted }}>
          {renderInline(buf.join(" "), k())}
        </blockquote>
      );
      continue;
    }

    // unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*]\s+/, "")); i++; }
      blocks.push(
        <ul key={k()} className="my-2 list-disc space-y-1 pl-5 text-sm">
          {items.map((it, ii) => <li key={ii}>{renderInline(it, `li${ii}`)}</li>)}
        </ul>
      );
      continue;
    }

    // ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/, "")); i++; }
      blocks.push(
        <ol key={k()} className="my-2 list-decimal space-y-1 pl-5 text-sm">
          {items.map((it, ii) => <li key={ii}>{renderInline(it, `oli${ii}`)}</li>)}
        </ol>
      );
      continue;
    }

    // paragraph (gather consecutive plain lines)
    const buf: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,6})\s/.test(lines[i]) &&
      !lines[i].trim().startsWith("```") &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^\s*>\s?/.test(lines[i]) &&
      !/^\s*([-*_])\1{2,}\s*$/.test(lines[i])
    ) { buf.push(lines[i]); i++; }
    blocks.push(<p key={k()} className="my-2 text-sm leading-relaxed">{renderInline(buf.join(" "), k())}</p>);
  }

  return <div>{blocks}</div>;
}
