"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "usmle-write-key";

/**
 * Single-user write-key store (localStorage), mirroring the 4-Week Challenge
 * "who am I" pattern. The key is sent as x-write-key on every mutation.
 */
export function useWriteKey() {
  const [key, setKeyState] = useState<string>("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setKeyState(localStorage.getItem(STORAGE_KEY) || "");
    setReady(true);
  }, []);

  const setKey = useCallback((next: string) => {
    setKeyState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  /** Headers for a JSON mutation, including the write key. */
  const writeHeaders = useCallback(
    (): HeadersInit => ({ "content-type": "application/json", "x-write-key": key }),
    [key]
  );

  return { key, setKey, ready, writeHeaders };
}
