"use client";

import { ListMusic } from "lucide-react";
import { usePlayer, PlayerVideoSurface } from "@behindthemusictree/app-kit/player";
import { useTrackListSidebarVisibility } from "@behindthemusictree/app-kit/genre-tree";

interface PlayerProps {
  className?: string;
}

export default function Player({ className }: PlayerProps) {
  const { playerTrackObject } = usePlayer();
  const { toggleTrackListSidebar, isTrackListSidebarVisible } = useTrackListSidebarVisibility();

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 w-80 overflow-hidden rounded-lg bg-black shadow-2xl ${!playerTrackObject ? "hidden" : ""} ${className ?? ""}`}
    >
      <PlayerVideoSurface className="aspect-video w-full bg-black" />
      <button
        onClick={toggleTrackListSidebar}
        className="absolute top-2 right-2 rounded-full bg-black/70 p-1.5 text-white backdrop-blur hover:bg-black/90"
        aria-label={isTrackListSidebarVisible ? "Hide track list" : "Show track list"}
      >
        <ListMusic size={16} />
      </button>
      {playerTrackObject?.loadError && (
        <span className="absolute bottom-2 left-2 right-2 text-xs text-red-400 text-overflow">
          {playerTrackObject.loadError}
        </span>
      )}
    </div>
  );
}
