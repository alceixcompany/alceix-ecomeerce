"use client";
import { useEffect, useState } from "react";
// Keep SSR forms inert until their handlers are attached; entered values must not be lost to hydration.
export function useHydrated() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
}
