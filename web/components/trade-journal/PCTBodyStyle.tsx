"use client";

import { useEffect } from "react";

export default function PCTBodyStyle() {
  useEffect(() => {
    const body = document.body;
    const prev = body.style.backgroundColor;
    function sync() {
      body.style.backgroundColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-bg")
        .trim();
    }
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      observer.disconnect();
      body.style.backgroundColor = prev;
    };
  }, []);

  return null;
}
