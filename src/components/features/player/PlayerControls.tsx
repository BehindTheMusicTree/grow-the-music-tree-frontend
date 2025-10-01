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
      <button
        onClick={onPrevious}
        className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        aria-label="Previous track"
      >
        <FaStepBackward size={16} />
      </button>
      <button
        onClick={onPlayPause}
        className="w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <FaPause size={24} /> : <FaPlay size={24} className="ml-1" />}
      </button>
      <button
        onClick={onNext}
        className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        aria-label="Next track"
      >
        <FaStepForward size={16} />
      </button>
    </div>
  );
}
