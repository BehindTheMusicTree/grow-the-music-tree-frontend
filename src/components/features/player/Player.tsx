"use client";

import { useEffect, useState } from "react";
import { ListMusic, X } from "lucide-react";
import { usePlayer, PlayerVideoSurface } from "@behindthemusictree/app-kit/player";
import { TrackListSidebar, useTrackListSidebarVisibility } from "@behindthemusictree/app-kit/genre-tree";

interface PlayerProps {
  className?: string;
}

const iconButtonClassName = "flex h-6 w-6 shrink-0 items-center justify-center p-0 rounded-md hover:bg-white/10";

export default function Player({ className }: PlayerProps) {
  const { playerTrackObject } = usePlayer();
  const { toggleTrackListSidebar, isTrackListSidebarVisible } = useTrackListSidebarVisibility();
  const [dismissed, setDismissed] = useState(false);
  const track = playerTrackObject?.track;

  useEffect(() => {
    setDismissed(false);
  }, [track?.id]);

  // Hidden via CSS, never unmounted, so the video keeps playing while the panel is closed.
  // Geometry mirrors the genre-tree-view info panel: 60px top (under the header), 280px wide,
  // capped 164px above the bottom to clear the tree's zoom controls.
  return (
    <div
      className={`fixed right-3 top-[60px] z-40 flex max-h-[calc(100vh-224px)] w-[280px] flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)] ${!playerTrackObject || dismissed ? "hidden" : ""} ${className ?? ""}`}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-zinc-800 py-2.5 pl-3.5 pr-2">
        <span className="min-w-0 truncate text-sm font-semibold">{track?.title}</span>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={toggleTrackListSidebar}
            className={iconButtonClassName}
            aria-label={isTrackListSidebarVisible ? "Hide track list" : "Show track list"}
          >
            <ListMusic size={16} />
          </button>
          <button onClick={() => setDismissed(true)} className={iconButtonClassName} aria-label="Close player">
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="relative w-full shrink-0">
        <PlayerVideoSurface className="aspect-video w-full bg-black" />
        {playerTrackObject?.loadError && (
          <span className="absolute bottom-2 left-2 right-2 text-xs text-red-400 text-overflow">
            {playerTrackObject.loadError}
          </span>
        )}
      </div>
      {isTrackListSidebarVisible && <TrackListSidebar layout="inline" className="min-h-0 flex-1" />}
    </div>
  );
}
