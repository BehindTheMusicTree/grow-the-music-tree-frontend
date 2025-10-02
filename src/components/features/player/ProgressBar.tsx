"use client";

import { usePlayer, useCurrentTime } from "@contexts/PlayerContext";

interface ProgressBarProps {
  className?: string;
}

export default function ProgressBar({ className }: ProgressBarProps) {
  const { duration, playerUploadedTrackObject } = usePlayer();
  const currentTime = useCurrentTime();

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!playerUploadedTrackObject?.audioElement) return;

    const newTime = parseFloat(e.target.value);
    playerUploadedTrackObject.audioElement.currentTime = newTime;
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!playerUploadedTrackObject || duration === 0) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <span className="text-xs text-gray-400 w-6 text-right mr-2">{formatTime(currentTime)}</span>
      <input
        type="range"
        min="0"
        max={duration}
        value={currentTime}
        onChange={handleSeek}
        className="w-80 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #374151 ${
            (currentTime / duration) * 100
          }%, #374151 100%)`,
        }}
      />
      <span className="text-xs text-gray-400 w-6 text-left ml-2">{formatTime(duration)}</span>
    </div>
  );
}
