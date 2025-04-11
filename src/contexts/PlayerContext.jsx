"use client";

import { createContext, useState, useContext, useCallback } from "react";
import PropTypes from "prop-types";

export const PlayerContext = createContext();

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}

export function PlayerProvider({ children }) {
  const [playerUploadedTrackObject, setPlayerUploadedTrackObject] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [resetSeekSignal, setResetSeekSignalState] = useState(0);
  const [stopProgressAnimationSignal, setStopProgressAnimationSignalState] = useState(0);
  const [playState, setPlayState] = useState("STOPPED");

  const setResetSeekSignal = useCallback((value) => {
    setResetSeekSignalState(value);
  }, []);

  const setStopProgressAnimationSignal = useCallback((value) => {
    setStopProgressAnimationSignalState(value);
  }, []);

  const handlePlayPauseAction = useCallback(() => {
    if (playState === "PLAYING") {
      setPlayState("PAUSED");
    } else if (playState === "PAUSED") {
      setPlayState("PLAYING");
    } else if (playState === "STOPPED") {
      setPlayState("PLAYING");
    }
  }, [playState]);

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
        resetSeekSignal,
        setResetSeekSignal,
        stopProgressAnimationSignal,
        setStopProgressAnimationSignal,
        playState,
        setPlayState,
        handlePlayPauseAction,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

PlayerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
