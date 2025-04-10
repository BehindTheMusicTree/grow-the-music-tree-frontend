import { FaSpotify } from "react-icons/fa";
import PropTypes from "prop-types";

export default function SpotifyAuthPopupChild({ popupContentObject }) {
  return (
    <div className="p-4">
      <div className="text-center mb-6">
        <FaSpotify className="text-[#1DB954] text-6xl mx-auto mb-4" />
        <p className="text-lg">{popupContentObject.message}</p>
      </div>
      <div className="flex justify-center">
        <button
          onClick={popupContentObject.onAuthenticate}
          className="px-6 py-3 bg-[#1DB954] text-white font-semibold rounded-full 
                   hover:bg-opacity-90 transition-all duration-200 flex items-center"
        >
          <FaSpotify className="mr-2" />
          Connect with Spotify
        </button>
      </div>
    </div>
  );
}

SpotifyAuthPopupChild.propTypes = {
  popupContentObject: PropTypes.shape({
    message: PropTypes.string.isRequired,
    onAuthenticate: PropTypes.func.isRequired,
  }).isRequired,
};