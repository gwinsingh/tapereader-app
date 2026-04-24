"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = { universe: { symbol: string; name: string }[] };

export default function TickerSearch({ universe }: Props) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const matches = q
    ? universe
        .filter(
          (u) =>
            u.symbol.toLowerCase().startsWith(q.toLowerCase()) ||
            u.name.toLowerCase().includes(q.toLowerCase()),
        )
        .slice(0, 8)
    : [];

  const submit = (sym: string) => {
    setQ("");
    setOpen(false);
    inputRef.current?.blur();
    router.push(`/ticker/${sym.toUpperCase()}`);
  };

  return (
    <div className="relative w-64">
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && q) {
            if (matches[0]) submit(matches[0].symbol);
            else submit(q);
          }
          if (e.key === "Escape") {
            setOpen(false);
            inputRef.current?.blur();
          }
        }}
        placeholder="Search ticker  (press /)"
        className="w-full rounded border border-border bg-panel px-3 py-1.5 font-mono text-sm text-text placeholder:text-muted focus:border-accent focus:outline-none"
      />
      {open && matches.length > 0 && (
        <ul className="absolute z-30 mt-1 w-full overflow-hidden rounded border border-border bg-panel shadow-xl">
          {matches.map((m) => (
            <li key={m.symbol}>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  submit(m.symbol);
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-border"
              >
                <span className="font-mono font-semibold">{m.symbol}</span>
                <span className="truncate pl-3 text-xs text-muted">{m.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
