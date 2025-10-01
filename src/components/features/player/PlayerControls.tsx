"use client";

import { FaPlay, FaPause, FaStepForward, FaStepBackward } from "react-icons/fa";

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function PlayerControls({ isPlaying, onPlayPause, onNext, onPrevious }: PlayerControlsProps) {
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
    </div>
  );
}
