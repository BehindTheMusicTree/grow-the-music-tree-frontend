"use client";

import { usePlayer, useCurrentTime } from "@behindthemusictree/app-kit/player";

interface ProgressBarProps {
  className?: string;
}

export default function ProgressBar({ className }: ProgressBarProps) {
  const { duration, playerTrackObject } = usePlayer();
  const currentTime = useCurrentTime();

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!playerTrackObject?.mediaController) return;

    const newTime = parseFloat(e.target.value);
    playerTrackObject.mediaController.setCurrentTime(newTime);
  };

  if (!playerTrackObject) {
    return (
      <input
        type="range"
        disabled
        value={0}
        aria-label="Seek"
        className={`h-1 w-full cursor-not-allowed appearance-none bg-gray-800 opacity-50 ${className ?? ""}`}
      />
    );
  }

  if (duration === 0) {
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
      className={`h-1 w-full cursor-pointer appearance-none bg-gray-800 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:opacity-0 [&::-moz-range-thumb]:transition-opacity [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:opacity-0 [&::-webkit-slider-thumb]:transition-opacity hover:[&::-moz-range-thumb]:opacity-100 hover:[&::-webkit-slider-thumb]:opacity-100 ${className ?? ""}`}
      style={{
        background: `linear-gradient(to right, #9ca3af ${progress}%, #27272a ${progress}%)`,
      }}
    />
  );
}
