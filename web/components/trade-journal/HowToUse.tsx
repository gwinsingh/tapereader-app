"use client";

import { useState } from "react";
import Image from "next/image";

export default function HowToUse() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-lg border"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold transition-colors hover:opacity-80"
        style={{ color: "var(--color-text)" }}
      >
        <span>How to Use</span>
        <span
          className="text-xs transition-transform"
          style={{ color: "var(--color-muted)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
      </button>

      {open && (
        <div
          className="space-y-6 border-t px-4 py-4 text-sm"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          <div>
            <h3 className="mb-3 font-semibold" style={{ color: "var(--color-accent)" }}>
              Step 1 — Export from DAS Trader
            </h3>
            <p className="mb-2" style={{ color: "var(--color-muted)" }}>
              Do this once every day, preferably at the end of the trading day:
            </p>
            <ol className="list-inside list-decimal space-y-1.5" style={{ color: "var(--color-text)" }}>
              <li>
                On the top left, click on <strong>Trade</strong>
              </li>
              <li>
                Click on <strong>Trade Log</strong> in the dropdown
              </li>
            </ol>
            <div className="my-3 overflow-hidden rounded-lg border" style={{ borderColor: "var(--color-border)" }}>
              <Image
                src="/images/help/help-journal-screenshot-1.png"
                alt="DAS Trader — Trade menu with Trade Log highlighted"
                width={500}
                height={450}
                className="w-full max-w-md"
              />
            </div>
            <ol className="list-inside list-decimal space-y-1.5" start={3} style={{ color: "var(--color-text)" }}>
              <li>
                A new window will open. Right-click anywhere in the window and click <strong>Export</strong>
              </li>
            </ol>
            <div className="my-3 overflow-hidden rounded-lg border" style={{ borderColor: "var(--color-border)" }}>
              <Image
                src="/images/help/help-journal-screenshot-2.png"
                alt="DAS Trader — Trade Log window with right-click Export option"
                width={400}
                height={350}
                className="w-full max-w-sm"
              />
            </div>
            <ol className="list-inside list-decimal space-y-1.5" start={4} style={{ color: "var(--color-text)" }}>
              <li>
                Save the file — it will contain all of your trading logs from today
              </li>
            </ol>
          </div>

          <div>
            <h3 className="mb-3 font-semibold" style={{ color: "var(--color-accent)" }}>
              Step 2 — Upload &amp; Process
            </h3>
            <ol className="list-inside list-decimal space-y-1.5" style={{ color: "var(--color-text)" }}>
              <li>Select the <strong>trade date</strong> (defaults to today)</li>
              <li>Drag and drop your exported CSV file, or click the upload area to browse</li>
              <li>Click <strong>Upload &amp; Process</strong></li>
              <li>Review the trade summary and performance stats</li>
              <li>
                Click <strong>Open Trade Journal »</strong> to view your trades in the shared Google Sheet
              </li>
            </ol>
          </div>

          <div>
            <h3 className="mb-3 font-semibold" style={{ color: "var(--color-accent)" }}>
              Step 3 — Complete Your Journal
            </h3>
            <p style={{ color: "var(--color-muted)" }}>
              In the Google Sheet, fill in the columns highlighted with a different header color.
              These are the columns that require your manual input:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1" style={{ color: "var(--color-text)" }}>
              <li><strong>R (Risk)</strong> — Your dollar risk on the trade. Used to calculate P&amp;L in R multiples.</li>
              <li><strong>Setup</strong> — The setup type (e.g. ORB, ABCD, VWAP Bounce). Select from the dropdown.</li>
              <li><strong>Process Followed?</strong> — Did you follow your trading plan? Yes or No.</li>
              <li><strong>Notes</strong> — Free-form notes about the trade, your thought process, or lessons learned.</li>
            </ul>
            <p className="mt-3" style={{ color: "var(--color-muted)" }}>
              There are also <strong>daily columns</strong> you fill in once on the first trade of each day:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1" style={{ color: "var(--color-text)" }}>
              <li><strong>Sleep Score</strong> — Your sleep quality (0–100).</li>
              <li><strong>Readiness Score</strong> — Your overall readiness to trade (0–100).</li>
              <li><strong>Emotional State</strong> — How you feel before trading (Calm, Anxious, Excited, Frustrated, Fatigued).</li>
              <li><strong>Market Bias</strong> — Your pre-market read (Bullish, Bearish, Neutral).</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
