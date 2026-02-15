"use client";

import { FaPlay, FaPause, FaStepForward, FaStepBackward } from "react-icons/fa";
import RingLoader from "@components/ui/RingLoader";

interface PlayerControlsProps {
  isPlaying: boolean;
  isLoading?: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  isNextDisabled?: boolean;
}

export default function PlayerControls({
  isPlaying,
  isLoading = false,
  onPlayPause,
  onNext,
  onPrevious,
  isNextDisabled = false,
}: PlayerControlsProps) {
  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={onPrevious}
        className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-200 hover:text-white transition-colors"
        aria-label="Previous track"
      >
        <FaStepBackward size={16} />
      </button>
      <button
        onClick={onPlayPause}
        className="w-14 h-14 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-200 hover:text-white transition-all duration-200 hover:scale-105"
        aria-label={isLoading ? "Loading" : isPlaying ? "Pause" : "Play"}
        disabled={isLoading}
      >
        {isLoading ? (
          <RingLoader size={24} />
        ) : isPlaying ? (
          <FaPause size={24} />
        ) : (
          <FaPlay size={24} className="ml-1" />
        )}
      </button>
      <button
        onClick={onNext}
        disabled={isNextDisabled}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none hover:bg-gray-700 hover:text-white"
        aria-label="Next track"
      >
        <FaStepForward size={16} />
      </button>
    </div>
  );
}
