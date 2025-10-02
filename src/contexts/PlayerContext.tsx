"use client";

import { createContext, useContext, useState, ReactNode, useRef, useEffect, useCallback, useMemo } from "react";
import { PlayStates } from "@models/PlayStates";
import { UploadedTrackDetailed } from "@domain/uploaded-track/response/detailed";
import { useDownloadTrack } from "@hooks/useUploadedTrack";

interface PlayerTrackObject {
  uploadedTrack: UploadedTrackDetailed;
  audioUrl?: string; // Direct URL to audio file
  audioElement?: HTMLAudioElement; // Audio element for playback
  isReady: boolean; // Audio data loaded and ready
  loadError?: string; // Loading error message
}

interface PlayerContextType {
  playerUploadedTrackObject: PlayerTrackObject | null;
  setPlayerUploadedTrackObject: (track: PlayerTrackObject | null) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  currentTimeRef: React.MutableRefObject<number>;
  duration: number;
  setDuration: (duration: number) => void;
  volume: number;
  setVolume: (volume: number) => void;
  playState: PlayStates;
  setPlayState: (state: PlayStates) => void;
  handlePlayPauseAction: () => void;
  loadTrackForPlayer: (track: UploadedTrackDetailed) => void;
  isLoading: boolean;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

interface PlayerProviderProps {
  children: ReactNode;
}

export function PlayerProvider({ children }: PlayerProviderProps) {
  const [playerUploadedTrackObject, setPlayerUploadedTrackObject] = useState<PlayerTrackObject | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [playState, setPlayState] = useState<PlayStates>(PlayStates.STOPPED);

  const [isLoading, setIsLoading] = useState(false);
  const [currentTrackUuid, setCurrentTrackUuid] = useState<string | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const processedTrackUuidRef = useRef<string | null>(null);

  // Use refs for high-frequency updates that don't need to trigger re-renders
  const currentTimeRef = useRef(0);

  // Download track data when UUID changes
  const { data: downloadData, isLoading: isDownloading } = useDownloadTrack(currentTrackUuid || "");

  // Debug logging removed to prevent console spam

  const handleDownloadComplete = useCallback(
    async (downloadData: unknown) => {
      try {
        setIsLoading(true);

        // Create blob from ArrayBuffer data
        if (!(downloadData instanceof ArrayBuffer)) {
          throw new Error("Expected ArrayBuffer data for audio file");
        }

        const blob = new Blob([downloadData], { type: "audio/mpeg" });
        const audioUrl = URL.createObjectURL(blob);

        // Create audio element
        const audio = new Audio(audioUrl);
        audio.volume = volume / 100; // Set initial volume
        audioElementRef.current = audio;

        // Set up audio event listeners
        audio.addEventListener("loadedmetadata", () => {
          setDuration(audio.duration);
        });

        audio.addEventListener("timeupdate", () => {
          // Only update ref - no state updates to prevent re-renders
          currentTimeRef.current = audio.currentTime;
        });

        audio.addEventListener("ended", () => {
          setPlayState(PlayStates.STOPPED);
          setIsPlaying(false);
        });

        audio.addEventListener("error", (e) => {
          console.error("Audio error event fired:", e);
        });

        audio.addEventListener("canplay", () => {});

        // Update player object with audio ready
        setPlayerUploadedTrackObject((prev) => {
          if (!prev) {
            console.warn("No playerUploadedTrackObject found when trying to update with audio");
            return prev;
          }

          const updatedPlayerObject = {
            ...prev,
            audioUrl,
            audioElement: audio,
            isReady: true,
            loadError: undefined,
          };

          // Auto-play the track when ready
          setPlayState(PlayStates.PLAYING);
          setIsPlaying(true);
          audio.play().catch((error) => {
            console.error("Error auto-playing audio:", error);
          });

          return updatedPlayerObject;
        });
      } catch (error) {
        console.error("Error processing audio data:", error);
        setPlayerUploadedTrackObject((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            isReady: false,
            loadError: "Failed to load audio data",
          };
        });
      } finally {
        setIsLoading(false);
      }
    },
    [volume] // Include dependencies
  );

  // Effect to handle download data and create audio URL
  useEffect(() => {
    if (currentTrackUuid && downloadData && !isDownloading && processedTrackUuidRef.current !== currentTrackUuid) {
      processedTrackUuidRef.current = currentTrackUuid;
      handleDownloadComplete(downloadData);
    }
  }, [currentTrackUuid, downloadData, isDownloading, handleDownloadComplete]);

  // Cleanup audio element on unmount
  useEffect(() => {
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
    };
  }, []);

  const loadTrackForPlayer = (track: UploadedTrackDetailed) => {
    // Stop current track if playing and clean up
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }

    // Clean up previous blob URL to prevent memory leaks
    setPlayerUploadedTrackObject((prev) => {
      if (prev?.audioUrl) {
        URL.revokeObjectURL(prev.audioUrl);
      }
      return null;
    });

    // Reset processed track UUID for new track
    processedTrackUuidRef.current = null;

    // Create initial player object
    const playerObject: PlayerTrackObject = {
      uploadedTrack: track,
      isReady: false,
    };
    setPlayerUploadedTrackObject(playerObject);

    // Trigger download by setting UUID
    setCurrentTrackUuid(track.uuid);
    setIsLoading(true);
    setPlayState(PlayStates.LOADING);
  };

  const handlePlayPauseAction = useCallback(() => {
    // If track is loading, do nothing - user will need to wait for it to finish loading
    if (playState === PlayStates.LOADING) {
      return;
    }

    if (!playerUploadedTrackObject?.isReady) {
      return;
    }

    const audioElement = playerUploadedTrackObject.audioElement || audioElementRef.current;
    if (!audioElement) {
      return;
    }

    if (playState === PlayStates.PLAYING) {
      audioElement.pause();
      setPlayState(PlayStates.PAUSED);
      setIsPlaying(false);
    } else if (playState === PlayStates.PAUSED) {
      audioElement.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
      setPlayState(PlayStates.PLAYING);
      setIsPlaying(true);
    } else if (playState === PlayStates.STOPPED) {
      audioElement.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
      setPlayState(PlayStates.PLAYING);
      setIsPlaying(true);
    }
  }, [playerUploadedTrackObject?.isReady, playerUploadedTrackObject?.audioElement, playState]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      playerUploadedTrackObject,
      setPlayerUploadedTrackObject,
      isPlaying,
      setIsPlaying,
      currentTimeRef,
      duration,
      setDuration,
      volume,
      setVolume,
      playState,
      setPlayState,
      handlePlayPauseAction,
      loadTrackForPlayer,
      isLoading,
    }),
    [
      playerUploadedTrackObject,
      isPlaying,
      duration,
      volume,
      playState,
      isLoading,
      handlePlayPauseAction,
      // Note: currentTimeRef is stable (ref), so it doesn't need to be in dependencies
    ]
  );

  return <PlayerContext.Provider value={contextValue}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}

// Custom hook for components that need real-time currentTime updates
export function useCurrentTime() {
  const { currentTimeRef } = usePlayer();
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(currentTimeRef.current);
    }, 100); // Update every 100ms for smooth UI

    return () => clearInterval(interval);
  }, [currentTimeRef]);

  return currentTime;
}
