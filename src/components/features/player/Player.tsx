"use client";

import { useState } from "react";
import { usePlayer } from "@contexts/PlayerContext";
import PlayerControls from "./PlayerControls";

interface PlayerProps {
  className?: string;
}

export default function Player({ className }: PlayerProps) {
  const { playerUploadedTrackObject, isLoading, isPlaying, setIsPlaying, volume, setVolume, handlePlayPauseAction } =
    usePlayer();

  const handleNext = () => {
    // Implement next track logic
  };

  const handlePrevious = () => {
    // Implement previous track logic
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    // Update audio element volume if it exists
    if (playerUploadedTrackObject?.audioElement) {
      playerUploadedTrackObject.audioElement.volume = newVolume / 100;
    }
  };

  if (!playerUploadedTrackObject) {
    return null;
  }

  return (
    <div className={`w-full bg-gray-900 text-white p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img
            src="/assets/album-cover-default.png"
            alt={playerUploadedTrackObject.uploadedTrack.title}
            className="w-16 h-16 rounded"
          />
          <div className="ml-4">
            <h3 className="font-bold">{playerUploadedTrackObject.uploadedTrack.title}</h3>
            <p className="text-gray-400">
              {playerUploadedTrackObject.uploadedTrack.artists.map((artist) => artist.name).join(", ")}
            </p>
            {isLoading && <p className="text-yellow-400 text-sm">Loading audio...</p>}
            {playerUploadedTrackObject.loadError && (
              <p className="text-red-400 text-sm">{playerUploadedTrackObject.loadError}</p>
            )}
          </div>
        </div>
        <PlayerControls
          isPlaying={isPlaying}
          onPlayPause={handlePlayPauseAction}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onVolumeChange={handleVolumeChange}
          currentVolume={volume}
        />
      </div>
    </div>
  );
}
