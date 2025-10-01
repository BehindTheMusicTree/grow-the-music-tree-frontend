"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { PlayStates } from "@models/PlayStates";
import { UploadedTrackDetailed } from "@domain/uploaded-track/response/detailed";

interface PlayerContextType {
  playerUploadedTrackObject: UploadedTrackDetailed | null;
  setPlayerUploadedTrackObject: (track: UploadedTrackDetailed | null) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
  volume: number;
  setVolume: (volume: number) => void;
  playState: PlayStates;
  setPlayState: (state: PlayStates) => void;
  handlePlayPauseAction: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

interface PlayerProviderProps {
  children: ReactNode;
}

export function PlayerProvider({ children }: PlayerProviderProps) {
  const [playerUploadedTrackObject, setPlayerUploadedTrackObject] = useState<UploadedTrackDetailed | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [playState, setPlayState] = useState<PlayStates>(PlayStates.STOPPED);

  const handlePlayPauseAction = () => {
    if (playState === PlayStates.PLAYING) {
      setPlayState(PlayStates.PAUSED);
      setIsPlaying(false);
    } else if (playState === PlayStates.PAUSED) {
      setPlayState(PlayStates.PLAYING);
      setIsPlaying(true);
    } else if (playState === PlayStates.STOPPED && playerUploadedTrackObject) {
      setPlayState(PlayStates.PLAYING);
      setIsPlaying(true);
    }
  };

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
        playState,
        setPlayState,
        handlePlayPauseAction,
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
