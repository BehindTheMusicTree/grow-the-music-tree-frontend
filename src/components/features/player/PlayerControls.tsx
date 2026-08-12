"use client";

import { FaPlay, FaPause, FaStepForward, FaStepBackward } from "react-icons/fa";
import { RingLoader } from "@behindthemusictree/app-kit/ui";

interface PlayerControlsProps {
  isPlaying: boolean;
  isLoading?: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  isNextDisabled?: boolean;
  disabled?: boolean;
}

export default function PlayerControls({
  isPlaying,
  isLoading = false,
  onPlayPause,
  onNext,
  onPrevious,
  isNextDisabled = false,
  disabled = false,
}: PlayerControlsProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onPrevious}
        disabled={disabled}
        className="bg-transparent text-gray-400 transition-colors hover:text-white disabled:pointer-events-none disabled:opacity-50"
        aria-label="Previous track"
      >
        <FaStepBackward size={14} />
      </button>
      <button
        onClick={onPlayPause}
        disabled={isLoading || disabled}
        className="bg-transparent text-gray-200 transition-colors hover:text-white disabled:pointer-events-none disabled:opacity-50"
        aria-label={isLoading ? "Loading" : isPlaying ? "Pause" : "Play"}
      >
        {isLoading ? <RingLoader size={18} /> : isPlaying ? <FaPause size={18} /> : <FaPlay size={18} />}
      </button>
      <button
        onClick={onNext}
        disabled={isNextDisabled || disabled}
        className="bg-transparent text-gray-400 transition-colors hover:text-white disabled:pointer-events-none disabled:opacity-50"
        aria-label="Next track"
      >
        <FaStepForward size={14} />
      </button>
    </div>
  );
}
