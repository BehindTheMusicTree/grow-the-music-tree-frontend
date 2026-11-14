"use client";

import { useEffect, useId, useState } from "react";
import { REGION_GLOBES, REGION_GLOBE_PATHS } from "./regionGlobePaths";

const ROTATION_INTERVAL_MS = 3000;

export function RegionGlobeIcon({ className, nightMode = false, colored = false }: { className?: string; nightMode?: boolean; colored?: boolean }) {
  const [index, setIndex] = useState(0);
  const nightClipId = useId();

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
      <circle cx="256" cy="256" r="256" className={colored ? "fill-green-500" : "fill-black"} />
      <path className={colored ? "fill-blue-500" : "fill-white"} data-testid="region-globe-path" d={REGION_GLOBE_PATHS[REGION_GLOBES[index]]} />
      {nightMode && (
        <>
          <defs>
            <clipPath id={nightClipId}>
              <rect x="256" y="-256" width="768" height="1024" transform="rotate(23.44 256 256)" />
            </clipPath>
          </defs>
          <circle data-testid="region-globe-night-shade" cx="256" cy="256" r="256" fill="black" opacity="0.5" clipPath={`url(#${nightClipId})`} />
        </>
      )}
    </svg>
  );
}
