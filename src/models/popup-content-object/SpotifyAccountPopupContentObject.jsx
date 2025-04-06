import PopupContentObject from "./PopupContentObject";
import { FaSpotify, FaExternalLinkAlt } from "react-icons/fa";

export default class SpotifyAccountPopupContentObject extends PopupContentObject {
  constructor(profile) {
    super();
    this.profile = profile;
  }

  getTitle() {
    return "Spotify Account";
  }

  getContent() {
    return (
      <div className="flex flex-col items-center p-4">
        {this.profile.images?.[0]?.url ? (
          <img
            src={this.profile.images[0].url}
            alt={this.profile.display_name}
            className="w-24 h-24 rounded-full mb-4"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-700 mb-4 flex items-center justify-center">
            <FaSpotify className="text-gray-400 text-4xl" />
          </div>
        )}

        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold text-white mb-1">{this.profile.display_name}</h3>
          <p className="text-gray-400 text-sm">{this.profile.email}</p>
        </div>

        <a
          href={`https://open.spotify.com/user/${this.profile.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-[#1DB954] hover:text-white transition-colors duration-200"
        >
          <span className="mr-2">View on Spotify</span>
          <FaExternalLinkAlt className="text-xs" />
        </a>
      </div>
    );
  }

  getFooter() {
    return null;
  }
}
