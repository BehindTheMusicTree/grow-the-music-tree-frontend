import { useState, useEffect, useRef } from "react";
import { PiGraphLight } from "react-icons/pi";
import { FaSpotify, FaSignOutAlt, FaExternalLinkAlt, FaCloudUploadAlt, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { usePage } from "../../contexts/page/usePage";
import useSpotifyAuth from "../../hooks/useSpotifyAuth";
import SpotifyService from "../../utils/services/SpotifyService";
import { usePopup } from "../../contexts/popup/usePopup";
import SpotifyAccountPopupContentObject from "../../models/popup-content-object/SpotifyAccountPopupContentObject.jsx";
import { PAGE_TYPES } from "../../utils/constants";

export default function Menu() {
  const { page } = usePage();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);
  const { login, hasValidToken } = useSpotifyAuth();
  const [profile, setProfile] = useState(null);
  const { showPopup } = usePopup();
  const navigate = useNavigate();

  useEffect(() => {
    if (hasValidToken()) {
      const storedProfile = SpotifyService.getSpotifyProfile();
      setProfile(storedProfile);
    } else {
      setProfile(null);
    }
  }, [hasValidToken]);

  const handleUploadedLibraryClick = () => {
    navigate("/uploaded-library");
  };

  const handleGenrePlaylistsClick = () => {
    navigate("/genre-playlists");
  };

  const handleSpotifyLibraryClick = () => {
    navigate("/spotify-library");
  };

  const handleUserClick = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleSignUpWithSpotify = () => {
    login();
    setShowUserMenu(false);
  };

  const handleSignOut = () => {
    SpotifyService.clearSpotifyAuth();
    setShowUserMenu(false);
    // Force a re-render to trigger the auth popup
    window.location.reload();
  };

  const handleAccountClick = () => {
    if (profile) {
      const popup = new SpotifyAccountPopupContentObject(profile);
      showPopup(popup);
      setShowUserMenu(false);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="menu-container bg-black flex-col justify-center items-start pt-2 px-1">
      <div className="menu-item-container group" onClick={handleGenrePlaylistsClick}>
        <div
          className={
            page.type === PAGE_TYPES.GENRE_PLAYLISTS
              ? "menu-item-icon-container-active"
              : "menu-item-icon-container hover:bg-gray-800 transition-colors duration-200"
          }
        >
          <PiGraphLight className="text-2xl text-white" />
        </div>
      </div>
      <div className="menu-item-container group" onClick={handleUploadedLibraryClick}>
        <div
          className={
            page.type === PAGE_TYPES.UPLOADED_LIBRARY
              ? "menu-item-icon-container-active"
              : "menu-item-icon-container hover:bg-gray-800 transition-colors duration-200"
          }
        >
          <FaCloudUploadAlt className="text-2xl text-white group-hover:scale-110 transition-transform duration-200" />
        </div>
      </div>
      <div className="menu-item-container group" onClick={handleSpotifyLibraryClick}>
        <div
          className={
            page.type === PAGE_TYPES.SPOTIFY_LIBRARY
              ? "menu-item-icon-container-active"
              : "menu-item-icon-container hover:bg-gray-800 transition-colors duration-200"
          }
        >
          <FaSpotify className="text-2xl text-white group-hover:scale-110 transition-transform duration-200" />
        </div>
      </div>
      <div className="flex-grow"></div>
      <div className="menu-item-container relative mb-2" ref={menuRef}>
        <div
          className={`menu-item-icon-container transition-all duration-200 ${
            showUserMenu ? "bg-gray-700 shadow-lg" : "hover:bg-gray-800"
          }`}
          onClick={handleUserClick}
        >
          <FaUser className="text-2xl text-white" />
        </div>
        <div
          className={`
          absolute left-full ml-2 bg-gray-800 rounded-lg shadow-xl py-2 min-w-[200px]
          transform transition-all duration-200 origin-left
          ${
            showUserMenu
              ? "opacity-100 scale-100 translate-x-0"
              : "opacity-0 scale-95 -translate-x-2 pointer-events-none"
          }
        `}
        >
          {hasValidToken() ? (
            <>
              {profile && (
                <div
                  className="px-3 py-2 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors duration-200"
                  onClick={handleAccountClick}
                >
                  <div className="flex items-center">
                    {profile.images?.[0]?.url ? (
                      <img
                        src={profile.images[0].url}
                        alt={profile.display_name}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-700 mr-2 flex items-center justify-center">
                        <FaUser className="text-xl text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{profile.display_name}</div>
                      <div className="text-xs text-gray-400">Spotify Account</div>
                    </div>
                    <FaExternalLinkAlt className="text-base text-gray-400" />
                  </div>
                </div>
              )}
              <button
                className="w-full px-3 py-2 text-left text-white hover:bg-red-600 flex items-center
                     transition-all duration-200 group"
                onClick={handleSignOut}
              >
                <FaSignOutAlt className="mr-2 text-xl text-red-500 group-hover:text-white transition-colors duration-200" />
                <div>
                  <div className="text-sm font-medium">Sign out</div>
                  <div className="text-xs text-gray-400 group-hover:text-gray-200">Disconnect from Spotify</div>
                </div>
              </button>
            </>
          ) : (
            <button
              className="w-full px-3 py-2 text-left text-white hover:bg-[#1DB954] flex items-center
                     transition-all duration-200 group"
              onClick={handleSignUpWithSpotify}
            >
              <FaSpotify className="mr-2 text-xl text-[#1DB954] group-hover:text-white transition-colors duration-200" />
              <div>
                <div className="text-sm font-medium">Sign in with Spotify</div>
                <div className="text-xs text-gray-400 group-hover:text-gray-200">Connect your Spotify account</div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
