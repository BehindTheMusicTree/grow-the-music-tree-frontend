"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FaVolumeUp, FaVolumeMute, FaList } from "react-icons/fa";
import { usePlayer, useCurrentTime } from "@contexts/PlayerContext";
import { useTrackList } from "@contexts/TrackListContext";
import { useTrackListSidebarVisibility } from "@contexts/TrackListSidebarVisibilityContext";
import PlayerControls from "./PlayerControls";
import ProgressBar from "./ProgressBar";

interface PlayerProps {
  className?: string;
}

export default function Player({ className }: PlayerProps) {
  const {
    playerUploadedTrackObject,
    isLoading,
    isPlaying,
    volume,
    setVolume,
    handlePlayPauseAction,
    handleNextTrack,
    handlePreviousTrack,
  } = usePlayer();
  const { trackList, selectedTrack, setSelectedTrack } = useTrackList();
  const currentTime = useCurrentTime();
  const { toggleTrackListSidebar, isTrackListSidebarVisible } = useTrackListSidebarVisibility();
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);

  const handleNext = () => {
    if (trackList && selectedTrack) {
      handleNextTrack(trackList.uploadedTracks, selectedTrack, setSelectedTrack);
    }
  };

  const handlePrevious = () => {
    if (!playerUploadedTrackObject?.audioElement) return;

    // If we're at least 1 second into the track, restart the current song
    if (currentTime >= 1) {
      playerUploadedTrackObject.audioElement.currentTime = 0;
      return;
    }

    // If less than 1 second, go to previous track
    if (trackList && selectedTrack) {
      handlePreviousTrack(trackList.uploadedTracks, selectedTrack, setSelectedTrack);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    // Update audio element volume if it exists
    if (playerUploadedTrackObject?.audioElement) {
      playerUploadedTrackObject.audioElement.volume = newVolume / 100;
    }
  };

  const handleVolumeToggle = () => {
    if (isMuted) {
      // Unmute: restore previous volume
      setVolume(previousVolume);
      if (playerUploadedTrackObject?.audioElement) {
        playerUploadedTrackObject.audioElement.volume = previousVolume / 100;
      }
      setIsMuted(false);
    } else {
      // Mute: save current volume and set to 0
      setPreviousVolume(volume);
      setVolume(0);
      if (playerUploadedTrackObject?.audioElement) {
        playerUploadedTrackObject.audioElement.volume = 0;
      }
      setIsMuted(true);
    }
  };

  if (!playerUploadedTrackObject) {
    return null;
  }

  return (
    <div className={`w-full bg-black text-white p-4 h-player ${className}`}>
      <div className="flex items-center h-full">
        <div className="flex items-center flex-1 min-w-0">
          <Image
            src="/assets/album-cover-default.png"
            alt={playerUploadedTrackObject.uploadedTrack.title}
            width={64}
            height={64}
            className="w-16 h-16 rounded flex-shrink-0"
          />
          <div className="ml-4 min-w-0 flex-1 flex flex-col justify-center">
            <h3 className="font-bold text-lg text-overflow">{playerUploadedTrackObject.uploadedTrack.title}</h3>
            <p className="text-gray-400 text-base text-overflow">
              {playerUploadedTrackObject.uploadedTrack.artists.map((artist) => artist.name).join(", ")}
            </p>
            {playerUploadedTrackObject.loadError && (
              <p className="text-red-400 text-sm text-overflow">{playerUploadedTrackObject.loadError}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col justify-center items-center flex-1 space-y-3">
          <PlayerControls
            isPlaying={isPlaying}
            isLoading={isLoading}
            onPlayPause={handlePlayPauseAction}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
          <ProgressBar />
        </div>
        <div className="flex items-center justify-end flex-1">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleVolumeToggle}
                className="text-gray-400 hover:text-white bg-transparent transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
              </button>
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
              className={`bg-transparent transition-colors ${
                isTrackListSidebarVisible ? "text-white" : "text-gray-400 hover:text-white"
              }`}
              aria-label="Toggle tracklist"
            >
              <FaList size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
