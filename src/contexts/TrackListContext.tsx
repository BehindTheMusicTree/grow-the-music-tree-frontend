"use client";

import { createContext, useState, useContext, ReactNode } from "react";
import { UploadedTrackDetailed } from "@schemas/domain/uploaded-track/response";
import TrackList from "@models/track-list/TrackList";

interface TrackListContextType {
  trackList: TrackList | null;
  setTrackList: (trackList: TrackList) => void;
  selectedTrack: UploadedTrackDetailed | null;
  setSelectedTrack: (track: UploadedTrackDetailed | null) => void;
  toTrackAtPosition: (position: number) => void;
  playNewTrackListFromUploadedTrackUuid: (uuid: string) => void;
}

const TrackListContext = createContext<TrackListContextType | undefined>(undefined);

interface TrackListProviderProps {
  children: ReactNode;
}

export function TrackListProvider({ children }: TrackListProviderProps) {
  const [trackList, setTrackList] = useState<TrackList | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<UploadedTrackDetailed | null>(null);

  const toTrackAtPosition = (position: number) => {
    if (trackList && position >= 0 && position < trackList.uploadedTracks.length) {
      setSelectedTrack(trackList.uploadedTracks[position]);
    }
  };

  const playNewTrackListFromUploadedTrackUuid = (uuid: string) => {
    // Implementation will depend on your specific requirements
    // This is a placeholder for the actual implementation
    console.log(`Playing track list from uploaded track UUID: ${uuid}`);
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
