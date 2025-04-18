"use client";

import BasePopup from "./BasePopup";
import { FaSpotify } from "react-icons/fa";
import PropTypes from "prop-types";
import Button from "@components/ui/Button";

export default function SpotifyAuthPopup({ message, onAuthenticate, className = "" }) {
  return (
    <BasePopup title="Connect to Spotify" className={`max-w-md ${className}`}>
      <div className="flex flex-col items-center space-y-8 py-4">
        <FaSpotify className="text-[#1DB954] text-7xl" />
        <div className="space-y-3 text-center">
          <p className="text-xl font-medium text-gray-800">{message}</p>
          <p className="text-sm text-gray-500">Access your Spotify library and playlists seamlessly</p>
        </div>
        <Button
          onClick={onAuthenticate}
          className="bg-[#1DB954] hover:bg-[#1DB954]/90 text-white w-full max-w-xs transform transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl"
        >
          <FaSpotify className="mr-2 text-lg" />
          Music Tree requires Spotify authentication
        </Button>
      </div>
    </BasePopup>
  );
}

SpotifyAuthPopup.propTypes = {
  onClose: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
  onAuthenticate: PropTypes.func.isRequired,
  className: PropTypes.string,
};
