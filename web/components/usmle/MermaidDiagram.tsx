"use client";

import { useEffect, useRef, useState } from "react";

// Lazy-loaded Mermaid renderer. mermaid is large and browser-only, so it's
// dynamically imported inside useEffect (never on the server / edge worker).
// Renders the diagram to SVG; on any parse error falls back to showing the
// raw source so a malformed AI-generated diagram never breaks the note.

type Mermaid = {
  initialize: (cfg: Record<string, unknown>) => void;
  render: (id: string, code: string) => Promise<{ svg: string }>;
};

let mermaidPromise: Promise<Mermaid> | null = null;
function loadMermaid(): Promise<Mermaid> {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((m) => (m as unknown as { default: Mermaid }).default);
  }
  return mermaidPromise;
}

function currentTheme(): "dark" | "default" {
  if (typeof document === "undefined") return "default";
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "default";
}

export default function MermaidDiagram({ code }: { code: string }) {
  const [svg, setSvg] = useState<string>("");
  const [failed, setFailed] = useState(false);
  const idRef = useRef("mmd-" + Math.random().toString(36).slice(2, 10));

  useEffect(() => {
    let alive = true;
    setFailed(false);
    setSvg("");
    loadMermaid()
      .then((mermaid) => {
        mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: currentTheme() });
        return mermaid.render(idRef.current, code);
      })
      .then(({ svg }) => { if (alive) setSvg(svg); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [code]);

  if (failed) {
    return (
      <pre className="overflow-x-auto rounded border p-3 font-mono text-xs" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}>
        <code>{code}</code>
      </pre>
    );
  }
  if (!svg) {
    return <div className="my-2 text-xs" style={{ color: "var(--color-muted)" }}>rendering diagram…</div>;
  }
  return <div className="my-3 flex justify-center overflow-x-auto" dangerouslySetInnerHTML={{ __html: svg }} />;
}
