"use client";

import { usePathname } from "next/navigation";

export default function WIPBanner() {
  const pathname = usePathname();
  const isPCTRoute = pathname.startsWith("/pct-bootcamp");

  if (isPCTRoute) return null;

  return (
    <div className="border-b border-warn/20 bg-warn/5 px-4 py-2 text-center text-xs text-warn">
      <span className="font-semibold">Work in development.</span> The scanner pages run on sample data and are being
      rebuilt. The part in regular use is the{" "}
      <a href="/blog" className="font-semibold underline underline-offset-2 hover:text-text">
        research blog
      </a>
      .
    </div>
  );
}
