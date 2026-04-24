export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-panel">
      <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted">
        <p>
          <span className="font-mono font-semibold text-text">TapeReader</span> — a trader's tape-reading tool.
          Data is 15+ minutes delayed. Setups are generated algorithmically for educational and personal-research use.
        </p>
        <p className="mt-2">
          Not financial advice. Nothing on this site is a recommendation to buy or sell any security. You are responsible
          for your own trading decisions.
        </p>
      </div>
    </footer>
  );
}
