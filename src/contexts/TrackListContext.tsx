"use client";

import { createContext, useState, useContext, ReactNode } from "react";
import Track from "@/models/domain/uploaded-track";

interface TrackListContextType {
  trackList: Track[];
  setTrackList: (tracks: Track[]) => void;
  selectedTrack: Track | null;
  setSelectedTrack: (track: Track | null) => void;
  toTrackAtPosition: (position: number) => void;
  playNewTrackListFromUploadedTrackUuid: (uuid: string) => void;
}

const TrackListContext = createContext<TrackListContextType | undefined>(undefined);

interface TrackListProviderProps {
  children: ReactNode;
}

export function TrackListProvider({ children }: TrackListProviderProps) {
  const [trackList, setTrackList] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  const toTrackAtPosition = (position: number) => {
    if (position >= 0 && position < trackList.length) {
      setSelectedTrack(trackList[position]);
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
