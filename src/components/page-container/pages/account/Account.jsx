import { useState, useEffect } from "react";
import { FaSpotify, FaSignOutAlt } from "react-icons/fa";
import { CiUser } from "react-icons/ci";
import SpotifyService from "../../../../utils/services/SpotifyService";
import useSpotifyAuth from "../../../../hooks/useSpotifyAuth";

export default function Account() {
  const [profile, setProfile] = useState(null);
  const { hasValidToken } = useSpotifyAuth();

  useEffect(() => {
    if (hasValidToken()) {
      const storedProfile = SpotifyService.getSpotifyProfile();
      setProfile(storedProfile);
    } else {
      setProfile(null);
    }
  }, [hasValidToken]);

  const handleSignOut = () => {
    SpotifyService.clearSpotifyAuth();
    window.location.reload();
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <FaSpotify size={48} className="text-[#1DB954] mb-4" />
        <h2 className="text-xl font-bold mb-2">Not Connected</h2>
        <p className="text-gray-600 text-center">Please connect your Spotify account to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-6 mb-6">
          {profile.images?.[0]?.url ? (
            <img src={profile.images[0].url} alt={profile.display_name} className="w-24 h-24 rounded-full" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              <CiUser className="text-gray-400 text-4xl" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profile.display_name}</h1>
            <p className="text-gray-600">{profile.email}</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Spotify ID</h3>
              <p className="mt-1 text-sm text-gray-900">{profile.id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Followers</h3>
              <p className="mt-1 text-sm text-gray-900">{profile.followers?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <a
            href={profile.external_urls?.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-[#1DB954] text-sm font-medium rounded-md text-[#1DB954] hover:bg-[#1DB954] hover:text-white transition-colors duration-200"
          >
            <FaSpotify className="mr-2" />
            View on Spotify
          </a>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center px-4 py-2 border border-red-500 text-sm font-medium rounded-md text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-200"
          >
            <FaSignOutAlt className="mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
