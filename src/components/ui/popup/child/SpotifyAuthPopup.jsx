"use client";

import { FaSpotify } from "react-icons/fa";
import PropTypes from "prop-types";
import Button from "@components/ui/Button";

export default function SpotifyAuthPopup({ onAuthenticate, className = "" }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
    >
      <div className={`w-full max-w-md rounded-lg overflow-hidden shadow-xl ${className}`}>
        {/* Black header with white text */}
        <div className="bg-black p-4 text-white">
          <h3 id="popup-title" className="text-white font-semibold">
            Connect to Spotify
          </h3>
        </div>

        {/* Green content area */}
        <div className="bg-green-500 p-6">
          <div className="flex flex-col items-center space-y-8">
            <div className="space-y-3 text-center">
              <p className="text-lg text-white font-medium">
                Music Tree requires Spotify authentication to browse your library and explore new horizons
              </p>
            </div>
            <Button
              onClick={onAuthenticate}
              className="bg-black hover:bg-black/80 px-8 py-4 text-white w-fit transform transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl relative"
            >
              <div className="flex items-center">
                <FaSpotify className="text-4xl absolute left-8" />
                <p className="text-xl w-full text-center pl-16 pr-12">Sign in</p>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

SpotifyAuthPopup.propTypes = {
  onAuthenticate: PropTypes.func.isRequired,
  className: PropTypes.string,
};
