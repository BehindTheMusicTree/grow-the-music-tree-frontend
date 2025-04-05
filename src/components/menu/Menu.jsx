import { useState, useEffect, useRef } from "react";
import { LuLibrary } from "react-icons/lu";
import { PiGraphLight } from "react-icons/pi";
import { CiUser } from "react-icons/ci";
import { FaSpotify, FaMusic } from "react-icons/fa";

import Page from "../../models/Page";
import { PAGE_TYPES } from "../../utils/constants";
import { usePage } from "../../contexts/page/usePage";
import useSpotifyAuth from "../../hooks/useSpotifyAuth";

export default function Menu() {
  const { page, setPage } = usePage();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);
  const { checkTokenAndShowAuthIfNeeded, login } = useSpotifyAuth();

  const handleLibraryClick = () => {
    setPage(new Page(PAGE_TYPES.UPLOADED_LIBRARY, null));
  };

  const handleGenrePlaylistsClick = () => {
    setPage(new Page(PAGE_TYPES.GENRE_PLAYLISTS, null));
  };

  const handleSpotifyLibraryClick = () => {
    // Use the hook to check for a valid token and show popup if needed
    if (checkTokenAndShowAuthIfNeeded()) {
      setPage(new Page(PAGE_TYPES.SPOTIFY_LIBRARY, null));
    }
  };

  const handleUserClick = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleSignUpWithSpotify = () => {
    login();
    setShowUserMenu(false);
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
          <PiGraphLight className="text-lg" />
        </div>
      </div>
      <div className="menu-item-container group" onClick={handleLibraryClick}>
        <div
          className={
            page.type === PAGE_TYPES.UPLOADED_LIBRARY
              ? "menu-item-icon-container-active"
              : "menu-item-icon-container hover:bg-gray-800 transition-colors duration-200"
          }
        >
          <LuLibrary className="text-lg" />
        </div>
      </div>
      <div className="menu-item-container relative" ref={menuRef}>
        <div
          className={`menu-item-icon-container transition-all duration-200 ${
            showUserMenu ? "bg-gray-700 shadow-lg" : "hover:bg-gray-800"
          }`}
          onClick={handleUserClick}
        >
          <CiUser className="text-lg" />
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
          <button
            className="w-full px-3 py-2 text-left text-white hover:bg-[#1DB954] flex items-center
                     transition-all duration-200 group"
            onClick={handleSignUpWithSpotify}
          >
            <FaSpotify className="mr-2 text-base text-[#1DB954] group-hover:text-white transition-colors duration-200" />
            <div>
              <div className="text-sm font-medium">Sign in with Spotify</div>
              <div className="text-xs text-gray-400 group-hover:text-gray-200">Connect your Spotify account</div>
            </div>
          </button>
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
          <FaMusic className="text-lg text-[#1DB954] group-hover:scale-110 transition-transform duration-200" />
        </div>
      </div>
    </div>
  );
}
