"use client";

import { useEffect } from "react";
import { usePlayer } from "@behindthemusictree/app-kit/player";
import { PlayerPanel } from "@behindthemusictree/app-kit-ui/genre-tree";
import { usePlayerPanel } from "@contexts/PlayerPanelProvider";
import { trackEvent } from "@lib/analytics";
import { renderArtistLink } from "@components/features/artist/renderArtistLink";

interface PlayerProps {
  className?: string;
}

export default function Player({ className }: PlayerProps) {
  const { playerTrackObject } = usePlayer();
  const { isVisible, dismiss, isExpanded, setExpanded } = usePlayerPanel();
  const trackId = playerTrackObject?.track?.id;

  useEffect(() => {
    if (trackId) trackEvent("track_play");
  }, [trackId]);

  return (
    <PlayerPanel
      className={className}
      isVisible={isVisible}
      onClose={dismiss}
      expanded={isExpanded}
      onExpandedChange={setExpanded}
      renderArtistLink={renderArtistLink}
    />
  );
}
