"use client";

import { BasePopup } from "./BasePopup";
import { FaSpotify } from "react-icons/fa";
import PropTypes from "prop-types";
import Button from "@/components/client/ui/Button";

export function SpotifyAuthPopup({ onClose, message, onAuthenticate, className = "" }) {
  return (
    <BasePopup title="Spotify Authentication" onClose={onClose} className={`max-w-md ${className}`}>
      <div className="flex flex-col items-center space-y-6">
        <FaSpotify className="text-[#1DB954] text-6xl" />
        <p className="text-center text-lg">{message}</p>
        <Button onClick={onAuthenticate} className="bg-[#1DB954] hover:bg-[#1DB954]/90 text-white">
          <FaSpotify className="mr-2" />
          Connect with Spotify
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
