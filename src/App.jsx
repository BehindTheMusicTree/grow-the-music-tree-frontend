import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Howler } from "howler";

import { PageProvider } from "./contexts/page/PageContext";
import { TrackListSidebarVisibilityProvider } from "./contexts/track-list-sidebar-visibility/TrackListSidebarVisibilityContext";

import { usePlayer } from "./contexts/player/usePlayer";
import { usePopup } from "./contexts/popup/usePopup";
import useSpotifyAuth from "./hooks/useSpotifyAuth";

import Popup from "./components/popup/Popup";
import Banner from "./components/banner/Banner";
import Menu from "./components/menu/Menu";
import PageContainer from "./components/page-container/PageContainer";
import Player from "./components/player/Player";
import ApiErrorHandler from "./components/utils/ApiErrorHandler";
import NotFoundPage from "./components/utils/NotFoundPage";
import SpotifyCallback from "./components/auth/SpotifyCallback";
import { FaSpotify } from "react-icons/fa";

Howler.autoUnlock = true;

// Wrapper component that checks for Spotify authentication
function AuthenticatedApp() {
  const { playerUploadedTrackObject } = usePlayer();
  const { popupContentObject } = usePopup();
  const { hasValidToken, checkTokenAndShowPopupIfNeeded } = useSpotifyAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchSubmitted, setSearchSubmitted] = useState("");

  // Check authentication on component mount and whenever hasValidToken changes
  useEffect(() => {
    const checkAuth = () => {
      const isValid = hasValidToken();
      if (isValid !== isAuthenticated) {
        setIsAuthenticated(isValid);
        if (!isValid) {
          checkTokenAndShowPopupIfNeeded();
        }
      }
    };

    checkAuth();

    // Set up interval to periodically check token validity
    const authCheckInterval = setInterval(checkAuth, 60000); // Check every minute

    return () => clearInterval(authCheckInterval);
  }, [isAuthenticated]); // Only depend on isAuthenticated state

  const centerMaxHeight = {
    centerWithoutPlayer: "calc(100% - 100px)",
    centerWithPlayer: "calc(100% - 180px)",
  };

  // If popup content exists, we're already showing a popup (possibly auth)
  // so we'll render the app even if not authenticated
  const shouldRenderApp = isAuthenticated || popupContentObject;

  if (!shouldRenderApp) {
    // This is a fallback in case popup system somehow fails
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center p-6 bg-gray-800 rounded-lg shadow-xl">
          <div className="text-[#1DB954] mb-4">
            <FaSpotify size={48} />
          </div>
          <h1 className="text-xl font-medium text-white mb-3">Spotify Authentication Required</h1>
          <p className="text-gray-400 mb-4">You need to connect with Spotify to use this application.</p>
          <button
            onClick={checkTokenAndShowPopupIfNeeded}
            className="px-6 py-3 bg-[#1DB954] text-white font-medium rounded-full hover:bg-opacity-90 
                    transition-all duration-200 flex items-center justify-center mx-auto"
          >
            <FaSpotify className="mr-2" />
            Connect with Spotify
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app flex flex-col h-screen">
      <Banner className="fixed top-0 z-50" searchSubmitted={searchSubmitted} setSearchSubmitted={setSearchSubmitted} />
      <div
        className="center bg-green-500 flex-grow flex overflow-y-auto"
        style={{
          maxHeight: playerUploadedTrackObject ? centerMaxHeight.centerWithPlayer : centerMaxHeight.centerWithoutPlayer,
        }}
      >
        <Menu />
        <PageContainer />
      </div>
      {playerUploadedTrackObject && <Player />}
      {popupContentObject && <Popup />}
    </div>
  );
}

export default function App() {
  return (
    <ApiErrorHandler>
      <PageProvider>
        <TrackListSidebarVisibilityProvider>
          <Router>
            <Routes>
              <Route path="/" element={<AuthenticatedApp />} />
              <Route path="/auth/spotify/callback" element={<SpotifyCallback />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </TrackListSidebarVisibilityProvider>
      </PageProvider>
    </ApiErrorHandler>
  );
}
