"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface Track {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: string;
}

interface PlayerContextType {
  playerUploadedTrackObject: Track | null;
  setPlayerUploadedTrackObject: (track: Track | null) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
  volume: number;
  setVolume: (volume: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

interface PlayerProviderProps {
  children: ReactNode;
}

export function PlayerProvider({ children }: PlayerProviderProps) {
  const [playerUploadedTrackObject, setPlayerUploadedTrackObject] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);

  return (
    <PlayerContext.Provider
      value={{
        playerUploadedTrackObject,
        setPlayerUploadedTrackObject,
        isPlaying,
        setIsPlaying,
        currentTime,
        setCurrentTime,
        duration,
        setDuration,
        volume,
        setVolume,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
