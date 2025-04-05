import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Howler } from "howler";

import { PageProvider } from "./contexts/page/PageContext";
import { TrackListSidebarVisibilityProvider } from "./contexts/track-list-sidebar-visibility/TrackListSidebarVisibilityContext";

import { usePlayer } from "./contexts/player/usePlayer";
import { usePopup } from "./contexts/popup/usePopup";
import useSpotifyAuth from "./hooks/useSpotifyAuth";
import { useNotification } from "./contexts/notification/useNotification";

import Popup from "./components/popup/Popup";
import Banner from "./components/banner/Banner";
import Menu from "./components/menu/Menu";
import PageContainer from "./components/page-container/PageContainer";
import Player from "./components/player/Player";
import ApiErrorHandler from "./components/utils/ApiErrorHandler";
import NotFoundPage from "./components/utils/NotFoundPage";
import SpotifyCallback from "./components/auth/SpotifyCallback";

Howler.autoUnlock = true;

/**
 * Wrapper component that checks for Spotify authentication
 * Now supports non-blocking operation with notifications
 */
function AuthenticatedApp() {
  const { playerUploadedTrackObject } = usePlayer();
  const { popupContentObject } = usePopup();
  const { hasValidToken, checkTokenAndShowAuthIfNeeded } = useSpotifyAuth();
  const { showSpotify } = useNotification();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchSubmitted, setSearchSubmitted] = useState("");

  // Check authentication on component mount and whenever hasValidToken changes
  useEffect(() => {
    const checkAuth = () => {
      if (hasValidToken()) {
        if (!isAuthenticated) {
          setIsAuthenticated(true);
          // Only show success notification when transitioning from unauthenticated to authenticated
          showSpotify("Connected to Spotify");
        }
      } else {
        setIsAuthenticated(false);
        // Use non-blocking notification for authentication needs
        checkTokenAndShowAuthIfNeeded(false); // Pass false for non-blocking mode
      }
    };

    checkAuth();

    // Set up interval to periodically check token validity
    const authCheckInterval = setInterval(checkAuth, 60000); // Check every minute

    return () => clearInterval(authCheckInterval);
  }, [hasValidToken, isAuthenticated, showSpotify, checkTokenAndShowAuthIfNeeded]);

  const centerMaxHeight = {
    centerWithoutPlayer: "calc(100% - 100px)",
    centerWithPlayer: "calc(100% - 180px)",
  };

  // Always render the app now - user can browse even when auth is needed
  // Protected operations will trigger auth notifications when needed
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

/**
 * Main application component
 * Wraps all providers and routes
 */
export default function App() {
  return (
    <Router>
      <ApiErrorHandler>
        <PageProvider>
          <TrackListSidebarVisibilityProvider>
            <Routes>
              <Route path="/" element={<AuthenticatedApp />} />
              <Route path="/auth/spotify/callback" element={<SpotifyCallback />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </TrackListSidebarVisibilityProvider>
        </PageProvider>
      </ApiErrorHandler>
    </Router>
  );
}
