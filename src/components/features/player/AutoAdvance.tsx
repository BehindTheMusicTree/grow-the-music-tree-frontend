"use client";

import { useEffect } from "react";
import { usePlayer } from "@contexts/PlayerContext";
import { useTrackList } from "@contexts/TrackListContext";

export default function AutoAdvance() {
  const { handleNextTrack, setOnTrackEnd } = usePlayer();
  const { trackList, selectedTrack, setSelectedTrack } = useTrackList();

  useEffect(() => {
    const handleTrackEnd = () => {
      // Auto-advance to next track if available
      if (trackList && selectedTrack) {
        handleNextTrack(trackList.uploadedTracks, selectedTrack, setSelectedTrack);
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
