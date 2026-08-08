"use client";

import { useEffect } from "react";

// TEMPORARY instrumentation for diagnosing the genre-tree hover-toolbar flicker.
// Not meant to be merged as-is — remove once we have console output to work from.
//
// It watches three independent signals so we can tell which layer is misbehaving:
//  1. Every `fetch()` call, in case something is silently polling/refetching.
//  2. DOM mutations under the tree container, to catch the SVG being torn down
//     and rebuilt (GenreTree.tsx's effect does `selectAll("*").remove()` then
//     re-renders everything) while the mouse sits still.
//  3. Native mouseenter/mouseleave/mouseover/mouseout events (capture phase, so
//     they're seen regardless of which element they target), to see whether the
//     browser itself is toggling hover state with no real cursor movement.
export default function HoverFlickerDiagnostics() {
  useEffect(() => {
    const t0 = performance.now();
    const since = () => (performance.now() - t0).toFixed(1);

    const originalFetch = window.fetch.bind(window);
    window.fetch = (...args: Parameters<typeof fetch>) => {
      const url = typeof args[0] === "string" ? args[0] : (args[0] as Request).url;
      console.log(`[flicker-diag t=${since()}] fetch ${url}`);
      return originalFetch(...args);
    };

    let lastBatchAt = performance.now();
    const observer = new MutationObserver((mutations) => {
      const now = performance.now();
      const dt = (now - lastBatchAt).toFixed(1);
      lastBatchAt = now;

      let added = 0;
      let removed = 0;
      let toolbarAdded = false;
      let toolbarRemoved = false;
      let svgChildrenTorn = false;

      for (const m of mutations) {
        added += m.addedNodes.length;
        removed += m.removedNodes.length;
        for (const n of Array.from(m.addedNodes)) {
          if (n instanceof Element && n.id?.startsWith("toolbar-")) toolbarAdded = true;
        }
        for (const n of Array.from(m.removedNodes)) {
          if (n instanceof Element && n.id?.startsWith("toolbar-")) toolbarRemoved = true;
          if (n instanceof Element && n.tagName === "g") svgChildrenTorn = true;
        }
      }

      console.log(
        `[flicker-diag t=${since()}] mutations: added=${added} removed=${removed} dt=${dt}ms toolbarAdded=${toolbarAdded} toolbarRemoved=${toolbarRemoved}${svgChildrenTorn ? " FULL_REBUILD_SUSPECTED" : ""}`,
      );
    });

    const target = document.querySelector(".tree-container") ?? document.body;
    observer.observe(target, { childList: true, subtree: true });

    const logPointerEvent = (event: Event) => {
      const el = event.target as Element;
      const label = el instanceof Element ? `${el.tagName}${el.id ? "#" + el.id : ""}` : String(event.target);
      console.log(`[flicker-diag t=${since()}] ${event.type} -> ${label}`);
    };
    const types: (keyof DocumentEventMap)[] = ["mouseenter", "mouseleave", "mouseover", "mouseout"];
    types.forEach((type) => document.addEventListener(type, logPointerEvent, true));

    console.log(`[flicker-diag t=${since()}] instrumentation attached`);

    return () => {
      window.fetch = originalFetch;
      observer.disconnect();
      types.forEach((type) => document.removeEventListener(type, logPointerEvent, true));
    };
  }, []);

  return null;
}
