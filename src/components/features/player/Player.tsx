"use client";

import { useEffect } from "react";
import { usePlayer } from "@behindthemusictree/app-kit/player";
import { PlayerPanel } from "@behindthemusictree/app-kit-ui/genre-tree";
import { usePlayerPanel } from "@contexts/PlayerPanelProvider";
import { cn } from "@lib/utils";
import { trackEvent } from "@lib/analytics";
import { renderArtistLink } from "@components/features/artist/renderArtistLink";

interface PlayerProps {
  className?: string;
}

export default function Player({ className }: PlayerProps) {
  const { playerTrackObject } = usePlayer();
  const { isVisible, isExpanded, setExpanded } = usePlayerPanel();
  const trackId = playerTrackObject?.track?.id;

  useEffect(() => {
    if (trackId) trackEvent("track_play");
  }, [trackId]);

  return (
    <PlayerPanel
      className={cn(
        "max-md:max-h-[calc(100dvh-var(--layout-band-top)-var(--mobile-nav-h)-env(safe-area-inset-bottom)-var(--layout-gutter))] max-md:[&>div:last-child]:overflow-y-auto",
        className,
      )}
      isVisible={isVisible}
      expanded={isExpanded}
      onExpandedChange={setExpanded}
      renderArtistLink={renderArtistLink}
    />
  );
}
