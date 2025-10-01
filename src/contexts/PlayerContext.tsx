"use client";

import { createContext, useContext, useState, ReactNode, useRef, useEffect, useCallback } from "react";
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
  currentTime: number;
  setCurrentTime: (time: number) => void;
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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [playState, setPlayState] = useState<PlayStates>(PlayStates.STOPPED);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrackUuid, setCurrentTrackUuid] = useState<string | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const processedTrackUuidRef = useRef<string | null>(null);

  // Download track data when UUID changes
  const {
    data: downloadData,
    isLoading: isDownloading,
    error: downloadError,
  } = useDownloadTrack(currentTrackUuid || "");

  // Debug logging removed to prevent console spam

  const handleDownloadComplete = useCallback(
    async (downloadData: unknown) => {
      console.log("handleDownloadComplete called with:", {
        downloadData: downloadData ? "Present" : "Missing",
        downloadDataType: typeof downloadData,
        isArrayBuffer: downloadData instanceof ArrayBuffer,
      });

      try {
        setIsLoading(true);
        console.log("Set isLoading to true");

        // Create blob from ArrayBuffer data
        if (!(downloadData instanceof ArrayBuffer)) {
          throw new Error("Expected ArrayBuffer data for audio file");
        }

        const blob = new Blob([downloadData], { type: "audio/mpeg" });
        console.log("Created blob:", { size: blob.size, type: blob.type });

        const audioUrl = URL.createObjectURL(blob);
        console.log("Created audio URL:", audioUrl);

        // Create audio element
        const audio = new Audio(audioUrl);
        audio.volume = volume / 100; // Set initial volume
        audioElementRef.current = audio;
        console.log("Created audio element");

        // Set up audio event listeners
        audio.addEventListener("loadedmetadata", () => {
          console.log("Audio loadedmetadata event fired, duration:", audio.duration);
          setDuration(audio.duration);
        });

        audio.addEventListener("timeupdate", () => {
          setCurrentTime(audio.currentTime);
        });

        audio.addEventListener("ended", () => {
          console.log("Audio ended event fired");
          setPlayState(PlayStates.STOPPED);
          setIsPlaying(false);
        });

        audio.addEventListener("error", (e) => {
          console.error("Audio error event fired:", e);
        });

        audio.addEventListener("canplay", () => {
          console.log("Audio canplay event fired");
        });

        // Update player object with audio ready
        setPlayerUploadedTrackObject((prev) => {
          if (!prev) {
            console.warn("No playerUploadedTrackObject found when trying to update with audio");
            return prev;
          }

          console.log("Updating player object with audio ready");
          const updatedPlayerObject = {
            ...prev,
            audioUrl,
            audioElement: audio,
            isReady: true,
            loadError: undefined,
          };

          setPlayState(PlayStates.PLAYING);
          setIsPlaying(true);
          console.log("Attempting to play audio");
          audio.play().catch((error) => {
            console.error("Error playing audio:", error);
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
        console.log("Setting isLoading to false");
        setIsLoading(false);
      }
    },
    [] // Empty dependency array - function is stable
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
    console.log("loadTrackForPlayer called with track:", track.uuid, track.title);

    // Reset processed track UUID for new track
    processedTrackUuidRef.current = null;

    // Create initial player object
    const playerObject: PlayerTrackObject = {
      uploadedTrack: track,
      isReady: false,
    };
    setPlayerUploadedTrackObject(playerObject);
    console.log("Set playerUploadedTrackObject");

    // Trigger download by setting UUID
    setCurrentTrackUuid(track.uuid);
    setIsLoading(true);
    console.log("Set currentTrackUuid and isLoading");
  };

  const handlePlayPauseAction = () => {
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
        loadTrackForPlayer,
        isLoading,
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
