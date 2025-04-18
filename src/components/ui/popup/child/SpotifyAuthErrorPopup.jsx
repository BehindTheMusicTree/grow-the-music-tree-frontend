"use client";

import BasePopup from "./BasePopup";
import { FaSpotify } from "react-icons/fa";
import PropTypes from "prop-types";
import Button from "@components/ui/Button";

export default function SpotifyAuthErrorPopup({ onClose, message, details, onConnect, className = "" }) {
  return (
    <BasePopup title="Authentication Failed" onClose={onClose} className={`max-w-md ${className}`}>
      <div className="flex flex-col items-center space-y-8 py-4">
        <FaSpotify className="text-[#1DB954] text-7xl" />
        <div className="space-y-3 text-center">
          <p className="text-xl font-medium text-gray-800">{message}</p>
          {details && (
            <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">{details}</p>
          )}
        </div>
        <Button
          onClick={onConnect}
          className="bg-[#1DB954] hover:bg-[#1DB954]/90 text-white w-full max-w-xs transform transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl"
        >
          <FaSpotify className="mr-2 text-lg" />
          Try Again
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
