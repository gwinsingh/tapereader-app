"use client";

import { Fragment, type ReactNode } from "react";

// Cloze syntax: {{c1::answer}} or {{c1::answer::hint}} (Anki-compatible subset).
// Hidden state shows the hint (or "[…]"); revealed state shows the answer.
const CLOZE_RE = /\{\{c\d+::(.*?)\}\}/g;

/** Renders cloze text with deletions hidden or revealed. */
export function renderCloze(text: string, reveal: boolean): ReactNode {
  const parts: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  CLOZE_RE.lastIndex = 0;
  while ((m = CLOZE_RE.exec(text)) !== null) {
    if (m.index > last) parts.push(<Fragment key={`t${i}`}>{text.slice(last, m.index)}</Fragment>);
    const [answer, hint] = m[1].split("::");
    parts.push(
      <span
        key={`c${i}`}
        style={{
          color: reveal ? "var(--color-accent)" : "var(--color-muted)",
          fontWeight: 600,
          backgroundColor: reveal ? "transparent" : "var(--color-bg)",
          borderRadius: 3,
          padding: reveal ? 0 : "0 4px",
        }}
      >
        {reveal ? answer : hint ? `[${hint}]` : "[ … ]"}
      </span>
    );
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) parts.push(<Fragment key="tail">{text.slice(last)}</Fragment>);
  return <span className="whitespace-pre-wrap">{parts}</span>;
}

/** True if the text contains at least one cloze deletion. */
export function hasCloze(text: string): boolean {
  CLOZE_RE.lastIndex = 0;
  return CLOZE_RE.test(text);
}
