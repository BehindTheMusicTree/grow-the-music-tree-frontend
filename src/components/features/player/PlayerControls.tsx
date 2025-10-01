"use client";

import { ReactNode } from "react";
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeUp, FaList } from "react-icons/fa";

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onVolumeChange: (volume: number) => void;
  currentVolume: number;
  onToggleTracklist: () => void;
}

export default function PlayerControls({
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onVolumeChange,
  currentVolume,
  onToggleTracklist,
}: PlayerControlsProps) {
  return (
    <div className="flex items-center space-x-4">
      <button onClick={onPrevious} className="text-gray-400 hover:text-white" aria-label="Previous track">
        <FaStepBackward size={20} />
      </button>
      <button
        onClick={onPlayPause}
        className="text-gray-400 hover:text-white"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <FaPause size={24} /> : <FaPlay size={24} />}
      </button>
      <button onClick={onNext} className="text-gray-400 hover:text-white" aria-label="Next track">
        <FaStepForward size={20} />
      </button>
      <div className="flex items-center space-x-2">
        <FaVolumeUp className="text-gray-400" size={16} />
        <input
          type="range"
          min="0"
          max="100"
          value={currentVolume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="w-24"
        />
      </div>
      <button onClick={onToggleTracklist} className="text-gray-400 hover:text-white" aria-label="Toggle tracklist">
        <FaList size={20} />
      </button>
    </div>
  );
}
