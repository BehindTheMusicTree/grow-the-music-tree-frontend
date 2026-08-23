"use client";

import { useState } from "react";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { usePlayer, useCurrentTime, PlayerTrack, PlayerVideoSurface } from "@behindthemusictree/app-kit/player";
import { useTrackList, useTrackListSidebarVisibility } from "@behindthemusictree/app-kit/genre-tree";
import { TheMusicTreeByline } from "@behindthemusictree/brand/components";
import { toPlayerTrack } from "@lib/player-track";
import PlayerControls from "./PlayerControls";
import ProgressBar from "./ProgressBar";

interface PlayerProps {
  className?: string;
}

function formatTime(time: number): string {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function Player({ className }: PlayerProps) {
  const {
    playerTrackObject,
    isLoading,
    isPlaying,
    volume,
    setVolume,
    duration,
    handlePlayPauseAction,
    handleNextTrack,
    handlePreviousTrack,
  } = usePlayer();
  const { trackList, selectedTrack, setSelectedTrack } = useTrackList();
  const currentTime = useCurrentTime();
  const { toggleTrackListSidebar, isTrackListSidebarVisible } = useTrackListSidebarVisibility();
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);

  const hasNextTrack =
    !!trackList &&
    !!selectedTrack &&
    (() => {
      const tracks = trackList.tracks;
      const currentIndex = tracks.findIndex((t) => t.uuid === selectedTrack.uuid);
      return currentIndex !== -1 && currentIndex + 1 < tracks.length;
    })();

  const handleTrackChange = (track: PlayerTrack) => {
    const found = trackList?.tracks.find((t) => t.uuid === track.id) ?? null;
    setSelectedTrack(found);
  };

  const handleNext = () => {
    if (trackList && selectedTrack) {
      handleNextTrack(trackList.tracks.map(toPlayerTrack), toPlayerTrack(selectedTrack), handleTrackChange);
    }
  };

  const handlePrevious = () => {
    if (!playerTrackObject?.mediaController) return;

    // If we're at least 1 second into the track, restart the current song
    if (currentTime >= 1) {
      playerTrackObject.mediaController.setCurrentTime(0);
      return;
    }

    // If less than 1 second, go to previous track
    if (trackList && selectedTrack) {
      handlePreviousTrack(trackList.tracks.map(toPlayerTrack), toPlayerTrack(selectedTrack), handleTrackChange);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    playerTrackObject?.mediaController?.setVolume(newVolume);
  };

  const handleVolumeToggle = () => {
    if (isMuted) {
      // Unmute: restore previous volume
      setVolume(previousVolume);
      playerTrackObject?.mediaController?.setVolume(previousVolume);
      setIsMuted(false);
    } else {
      // Mute: save current volume and set to 0
      setPreviousVolume(volume);
      setVolume(0);
      playerTrackObject?.mediaController?.setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <div className={`relative w-full bg-black text-white h-player ${className ?? ""}`}>
      <ProgressBar className="absolute inset-x-0 top-0" />
      <div className="flex h-full items-center gap-4 px-4">
        <PlayerVideoSurface className="h-full aspect-square shrink-0 bg-black" />
        <button
          onClick={toggleTrackListSidebar}
          className="flex min-w-0 flex-1 flex-col items-start justify-center bg-transparent text-left"
          aria-label={isTrackListSidebarVisible ? "Hide track list" : "Show track list"}
        >
          <span className="text-sm font-medium text-overflow">
            {playerTrackObject?.track.title ?? "Nothing playing"}
          </span>
          <span className="text-xs text-gray-400 text-overflow">
            {playerTrackObject
              ? (playerTrackObject.track.artists?.map((artist) => artist.name).join(", ") ?? "")
              : "Pick a track from the tree"}
          </span>
          {playerTrackObject?.loadError && (
            <span className="text-xs text-red-400 text-overflow">{playerTrackObject.loadError}</span>
          )}
        </button>

        <div className="flex shrink-0 items-center gap-3">
          <PlayerControls
            isPlaying={isPlaying}
            isLoading={isLoading}
            onPlayPause={handlePlayPauseAction}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isNextDisabled={!hasNextTrack}
            disabled={!playerTrackObject}
          />
          <span className="hidden text-xs text-gray-500 sm:inline">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <button
            onClick={handleVolumeToggle}
            disabled={!playerTrackObject}
            className="bg-transparent text-gray-400 transition-colors hover:text-white disabled:pointer-events-none disabled:opacity-50"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            disabled={!playerTrackObject}
            aria-label="Volume"
            className="w-16 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <span className="inline-flex shrink-0 rounded-full border border-zinc-200 bg-white shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50">
          <TheMusicTreeByline imageStyle={{ height: 32, width: "auto" }} />
        </span>
      </div>
    </div>
  );
}
