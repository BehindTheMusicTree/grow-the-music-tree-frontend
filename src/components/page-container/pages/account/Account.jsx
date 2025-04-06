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
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 px-2">Account Settings</h1>
      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center space-x-4 p-4 border-b border-gray-100">
          {profile.images?.[0]?.url ? (
            <img src={profile.images[0].url} alt={profile.display_name} className="w-12 h-12 rounded-full" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <CiUser className="text-gray-400 text-2xl" />
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{profile.display_name}</h2>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>
        </div>

        <div className="px-4">
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="py-3">
              <h3 className="text-xs font-medium text-gray-500 uppercase">Spotify ID</h3>
              <p className="mt-1 text-sm text-gray-900">{profile.id}</p>
            </div>
            <div className="py-3 pl-4">
              <h3 className="text-xs font-medium text-gray-500 uppercase">Followers</h3>
              <p className="mt-1 text-sm text-gray-900">{profile.followers?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-b-lg">
          <a
            href={profile.external_urls?.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-[#1DB954] hover:bg-[#1DB954] hover:text-white border border-[#1DB954] transition-colors duration-200"
          >
            <FaSpotify className="mr-1.5" />
            View Profile
          </a>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-red-500 hover:bg-red-500 hover:text-white border border-red-500 transition-colors duration-200"
          >
            <FaSignOutAlt className="mr-1.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
