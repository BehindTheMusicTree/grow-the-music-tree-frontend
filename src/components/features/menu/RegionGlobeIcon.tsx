"use client";

import { useEffect, useState } from "react";
import { REGION_GLOBES, REGION_GLOBE_PATHS } from "./regionGlobePaths";

const ROTATION_INTERVAL_MS = 3000;

export function RegionGlobeIcon({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % REGION_GLOBES.length), ROTATION_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <svg viewBox="0 0 512 512" fill="currentColor" className={className} aria-hidden>
      <path d={REGION_GLOBE_PATHS[REGION_GLOBES[index]]} />
    </svg>
  );
}
