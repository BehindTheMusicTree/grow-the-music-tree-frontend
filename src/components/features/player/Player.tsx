"use client";

import React from "react";
import Image from "next/image";
import { FaVolumeUp, FaList } from "react-icons/fa";
import { usePlayer } from "@contexts/PlayerContext";
import { useTrackListSidebarVisibility } from "@contexts/TrackListSidebarVisibilityContext";
import PlayerControls from "./PlayerControls";
import ProgressBar from "./ProgressBar";

interface PlayerProps {
  className?: string;
}

export default function Player({ className }: PlayerProps) {
  const { playerUploadedTrackObject, isLoading, isPlaying, volume, setVolume, handlePlayPauseAction, currentTime } =
    usePlayer();
  const { toggleTrackListSidebar } = useTrackListSidebarVisibility();

  const handleNext = () => {
    // Implement next track logic
  };

  const handlePrevious = () => {
    if (!playerUploadedTrackObject?.audioElement) return;

    // If we're at least 1 second into the track, restart the current song
    if (currentTime >= 1) {
      playerUploadedTrackObject.audioElement.currentTime = 0;
      return;
    }

    // If less than 1 second, restart the current song (no previous track logic needed)
    playerUploadedTrackObject.audioElement.currentTime = 0;
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
    <div className={`w-full bg-black text-white p-4 ${className}`}>
      <div className="flex items-center">
        <div className="flex items-center flex-1">
          <Image
            src="/assets/album-cover-default.png"
            alt={playerUploadedTrackObject.uploadedTrack.title}
            width={64}
            height={64}
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
        <div className="flex justify-center flex-1">
          <PlayerControls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPauseAction}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        </div>
        <div className="flex items-center justify-end flex-1">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FaVolumeUp className="text-gray-400" size={16} />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-24"
              />
            </div>
            <button
              onClick={toggleTrackListSidebar}
              className="text-gray-400 hover:text-white bg-transparent"
              aria-label="Toggle tracklist"
            >
              <FaList size={20} />
            </button>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <ProgressBar />
      </div>
    </div>
  );
}
