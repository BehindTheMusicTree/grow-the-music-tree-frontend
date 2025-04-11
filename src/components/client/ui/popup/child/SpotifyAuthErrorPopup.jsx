"use client";

import { BasePopup } from "./BasePopup";
import { FaSpotify } from "react-icons/fa";
import PropTypes from "prop-types";
import Button from "@components/client/ui/Button";

export function SpotifyAuthErrorPopup({ onClose, message, details, onConnect, className = "" }) {
  return (
    <BasePopup title="Spotify Authentication Error" onClose={onClose} className={`max-w-md ${className}`}>
      <div className="flex flex-col items-center space-y-6">
        <FaSpotify className="text-[#1DB954] text-6xl" />
        <div className="text-center space-y-2">
          <p className="text-lg">{message}</p>
          {details && <p className="text-sm text-gray-500">{details}</p>}
        </div>
        <Button onClick={onConnect} className="bg-[#1DB954] hover:bg-[#1DB954]/90 text-white">
          <FaSpotify className="mr-2" />
          Connect with Spotify
        </Button>
      </div>
    </BasePopup>
  );
}

SpotifyAuthErrorPopup.propTypes = {
  onClose: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
  details: PropTypes.string,
  onConnect: PropTypes.func.isRequired,
  className: PropTypes.string,
};
