"use client";

import { FaSpotify } from "react-icons/fa";
import PropTypes from "prop-types";

/**
 * Child component for Spotify authentication error popups
 * Displays an error message and provides a button to connect with Spotify
 */
const SpotifyAuthErrorPopupChild = ({ popupContentObject }) => {
  const { message, details } = popupContentObject;

  const handleConnect = () => {
    popupContentObject.initiateLogin();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-[#1DB954] mb-4">
        <FaSpotify size={48} />
      </div>

      <p className="text-center mb-4">{message}</p>
      {details && <p className="text-sm text-gray-400 mb-6">{details}</p>}

      <button
        onClick={handleConnect}
        className="px-6 py-3 bg-[#1DB954] text-white font-medium rounded-full hover:bg-opacity-90 
                transition-all duration-200 flex items-center justify-center"
      >
        <FaSpotify className="mr-2" />
        Connect with Spotify
      </button>
    </div>
  );
};

SpotifyAuthErrorPopupChild.propTypes = {
  popupContentObject: PropTypes.shape({
    message: PropTypes.string.isRequired,
    details: PropTypes.string,
    initiateLogin: PropTypes.func.isRequired,
  }).isRequired,
};

export default SpotifyAuthErrorPopupChild;
