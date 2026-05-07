"use client";

import { usePathname } from "next/navigation";

export default function WIPBanner() {
  const pathname = usePathname();
  const isPCTRoute = pathname.startsWith("/pct-bootcamp");

  if (isPCTRoute) return null;

  return (
    <div className="border-b border-warn/20 bg-warn/5 px-4 py-2 text-center text-xs text-warn">
      This app is under active development — features may be incomplete or change without notice.
    </div>
  );
}
