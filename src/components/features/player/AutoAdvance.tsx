"use client";

import { useEffect } from "react";
import { usePlayer } from "@behindthemusictree/app-kit/player";
import { useTrackList, YoutubeTrackDetailed } from "@behindthemusictree/app-kit/genre-tree";
import { toPlayerTrack } from "@lib/player-track";

export default function AutoAdvance() {
  const { handleNextTrack, setOnTrackEnd } = usePlayer();
  const { trackList, selectedTrack, setSelectedTrack } = useTrackList<YoutubeTrackDetailed>();

  useEffect(() => {
    const handleTrackEnd = () => {
      // Auto-advance to next track if available
      if (trackList && selectedTrack) {
        handleNextTrack(trackList.tracks.map(toPlayerTrack), toPlayerTrack(selectedTrack), (track) => {
          const found = trackList.tracks.find((t) => t.uuid === track.id) ?? null;
          setSelectedTrack(found);
        });
      }
    };

    // Set the callback in the player context
    setOnTrackEnd(() => handleTrackEnd);

    // Cleanup: remove the callback when component unmounts
    return () => {
      setOnTrackEnd(null);
    };
  }, [handleNextTrack, setOnTrackEnd, trackList, selectedTrack, setSelectedTrack]);

  // This component doesn't render anything
  return null;
}
