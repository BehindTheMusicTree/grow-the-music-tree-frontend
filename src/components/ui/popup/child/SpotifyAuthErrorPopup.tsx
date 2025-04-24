"use client";

import { FaSpotify } from "react-icons/fa";
import { BasePopup } from "../BasePopup";
import { Button } from "@/components/ui/Button";

interface SpotifyAuthErrorPopupProps {
  message: string;
  details?: string;
  onClose: () => void;
}

export default function SpotifyAuthErrorPopup({ message, details, onClose }: SpotifyAuthErrorPopupProps) {
  return (
    <BasePopup title="Authentication Failed" onClose={onClose} type="error">
      <div className="flex flex-col items-center space-y-8 py-4">
        <FaSpotify className="text-[#1DB954] text-7xl" />
        <div className="space-y-3 text-center">
          <p className="text-xl font-medium text-gray-800">{message}</p>
          {details && (
            <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">{details}</p>
          )}
        </div>
        <Button
          onClick={onClose}
          className="bg-[#1DB954] hover:bg-[#1DB954]/90 text-white w-full max-w-xs transform transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl"
        >
          <FaSpotify className="mr-2 text-lg" />
          Try Again
        </Button>
      </div>
    </BasePopup>
  );
}
