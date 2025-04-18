"use client";

import BasePopup from "./BasePopup";
import { FaSpotify } from "react-icons/fa";
import PropTypes from "prop-types";
import Button from "@components/ui/Button";

export default function SpotifyAuthPopup({ onAuthenticate, className = "" }) {
  return (
    <BasePopup title="Connect to Spotify" className={`max-w-md ${className}`}>
      <div className="flex flex-col items-center space-y-8 py-4">
        <div className="space-y-3 text-center">
          <p className="text-lg text-gray-500">
            Music Tree requires Spotify authentication to browse your library and explore new horizons
          </p>
        </div>
        <Button
          onClick={onAuthenticate}
          className="bg-[#1DB954] hover:bg-[#1DB954]/90 text-white w-fit transform transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center justify-center fit-content">
            <FaSpotify className="mr-2 text-xl" />
            Sign in
          </div>
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
