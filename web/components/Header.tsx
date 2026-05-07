import Link from "next/link";
import TickerSearch from "./TickerSearch";
import { data } from "@/lib/data";

export default async function Header() {
  const universe = await data.getUniverse();
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold tracking-tight text-accent">TapeReader</span>
          <span className="hidden text-xs text-muted sm:inline">read the tape</span>
        </Link>
        <nav className="hidden items-center gap-4 text-sm text-muted md:flex">
          <Link href="/" className="hover:text-text">Dashboard</Link>
          <Link href="/watchlist" className="hover:text-text">Watchlist</Link>
          <Link href="/pct-bootcamp" className="hover:text-text">PCT Bootcamp</Link>
          <Link href="/about" className="hover:text-text">About</Link>
        </nav>
        <TickerSearch universe={universe} />
      </div>
    </header>
  );
}
