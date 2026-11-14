"use client";

import { ZoomControls } from "@behindthemusictree/ui";
import { cn } from "@lib/utils";

type Props = {
  canZoomIn: boolean;
  canZoomOut: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
};

export function RegionMapControls({ canZoomIn, canZoomOut, onZoomIn, onZoomOut, onFit }: Props) {
  return (
    <div
      className={cn(
        "absolute bottom-3 right-3 z-10 flex flex-col items-end gap-2 transition-[right] duration-200 md:flex-row motion-reduce:transition-none",
        // Clears an open right detail panel or the mobile sheet; :has() reads the panel's own state, which lives in each page.
        // Class names must stay literal so Tailwind's scanner can see them.
        "group-has-[[data-detail-panel][data-side=right]:not([data-collapsed=true])]:md:right-[calc(var(--layout-detail-panel-w)+0.75rem)]",
        "group-has-[[data-detail-panel][data-sheet=true]:not([data-collapsed=true])]:max-md:bottom-[calc(var(--layout-sheet-peek)+0.75rem)]",
        "group-has-[[data-detail-panel][data-sheet=true]_[aria-label='Resize_panel'][aria-expanded=true]]:max-md:hidden",
      )}
    >
      <ZoomControls
        className="[@media(pointer:coarse)]:hidden"
        canZoomIn={canZoomIn}
        canZoomOut={canZoomOut}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onFit={onFit}
      />
    </div>
  );
}
