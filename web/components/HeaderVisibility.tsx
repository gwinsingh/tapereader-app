"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function HeaderVisibility({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPCTRoute = pathname.startsWith("/pct-bootcamp");

  if (isPCTRoute) return null;
  return <>{children}</>;
}
