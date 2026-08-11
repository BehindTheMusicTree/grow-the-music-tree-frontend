"use client";

import { usePlayer, useCurrentTime } from "@behindthemusictree/app-kit/player";

interface ProgressBarProps {
  className?: string;
}

export default function ProgressBar({ className }: ProgressBarProps) {
  const { duration, playerTrackObject } = usePlayer();
  const currentTime = useCurrentTime();

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!playerTrackObject?.audioElement) return;

    const newTime = parseFloat(e.target.value);
    playerTrackObject.audioElement.currentTime = newTime;
  };

  if (!playerTrackObject || duration === 0) {
    return null;
  }

  const progress = (currentTime / duration) * 100;

  return (
    <input
      type="range"
      min="0"
      max={duration}
      value={currentTime}
      onChange={handleSeek}
      aria-label="Seek"
      className={`h-1 w-full cursor-pointer appearance-none bg-gray-800 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:opacity-0 [&::-webkit-slider-thumb]:transition-opacity hover:[&::-webkit-slider-thumb]:opacity-100 ${className ?? ""}`}
      style={{
        background: `linear-gradient(to right, #9ca3af ${progress}%, #27272a ${progress}%)`,
      }}
    />
  );
}
