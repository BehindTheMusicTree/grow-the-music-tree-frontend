"use client";

import { createContext, useState, useContext, ReactNode } from "react";
import { UploadedTrackDetailed } from "@domain/uploaded-track/response/detailed";
import TrackList, { TrackListFromUploadedTrack } from "@models/track-list/TrackList";
import { TrackListOriginFromUploadedTrack } from "@models/track-list/origin/TrackListOrigin";
import { usePlayer } from "./PlayerContext";
import { PlayStates } from "@models/PlayStates";

interface TrackListContextType {
  trackList: TrackList | null;
  setTrackList: (trackList: TrackList) => void;
  selectedTrack: UploadedTrackDetailed | null;
  setSelectedTrack: (track: UploadedTrackDetailed | null) => void;
  toTrackAtPosition: (position: number) => void;
  playNewTrackListFromUploadedTrackUuid: (track: UploadedTrackDetailed) => void;
}

const TrackListContext = createContext<TrackListContextType | undefined>(undefined);

interface TrackListProviderProps {
  children: ReactNode;
}

export function TrackListProvider({ children }: TrackListProviderProps) {
  const [trackList, setTrackList] = useState<TrackList | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<UploadedTrackDetailed | null>(null);
  const { setPlayerUploadedTrackObject, setPlayState } = usePlayer();

  const toTrackAtPosition = (position: number) => {
    if (trackList && position >= 0 && position < trackList.uploadedTracks.length) {
      setSelectedTrack(trackList.uploadedTracks[position]);
    }
  };

  const playNewTrackListFromUploadedTrackUuid = (track: UploadedTrackDetailed) => {
    // Create track list origin
    const origin = new TrackListOriginFromUploadedTrack(track);

    // Create new track list with only the selected track
    const newTrackList = new TrackListFromUploadedTrack([track], origin);

    // Set the track list and selected track
    setTrackList(newTrackList);
    setSelectedTrack(track);

    // Set the player track directly (no conversion needed)
    setPlayerUploadedTrackObject(track);

    // Start playback
    setPlayState(PlayStates.PLAYING);
  };

  return (
    <TrackListContext.Provider
      value={{
        trackList,
        setTrackList,
        selectedTrack,
        setSelectedTrack,
        toTrackAtPosition,
        playNewTrackListFromUploadedTrackUuid,
      }}
    >
      {children}
    </TrackListContext.Provider>
  );
}

export function useTrackList() {
  const context = useContext(TrackListContext);
  if (!context) {
    throw new Error("useTrackList must be used within a TrackListProvider");
  }
  return context;
}
