"use client";

import { useEffect, useState } from "react";
import { REGION_GLOBES, REGION_GLOBE_PATHS } from "./regionGlobePaths";

const ROTATION_INTERVAL_MS = 3000;

export function RegionGlobeIcon({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    const sync = () => {
      clearInterval(timer);
      timer = reducedMotion.matches
        ? undefined
        : setInterval(() => setIndex((i) => (i + 1) % REGION_GLOBES.length), ROTATION_INTERVAL_MS);
    };
    sync();
    reducedMotion.addEventListener("change", sync);
    return () => {
      reducedMotion.removeEventListener("change", sync);
      clearInterval(timer);
    };
  }, []);

  return (
    <svg viewBox="0 0 512 512" fill="currentColor" className={className} aria-hidden>
      <path data-testid="region-globe-path" d={REGION_GLOBE_PATHS[REGION_GLOBES[index]]} />
    </svg>
  );
}
