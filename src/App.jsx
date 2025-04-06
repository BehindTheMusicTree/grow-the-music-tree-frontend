import { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Howler } from "howler";

import { PageProvider } from "./contexts/page/PageContext";
import { TrackListSidebarVisibilityProvider } from "./contexts/track-list-sidebar-visibility/TrackListSidebarVisibilityContext";
import { GenrePlaylistsProvider } from "./contexts/genre-playlists/GenrePlaylistsContext";

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

Howler.autoUnlock = true;

/**
 * Wrapper component that checks for Spotify authentication
 * Now supports non-blocking operation with notifications
 */
function AuthenticatedApp() {
  const { playerUploadedTrackObject } = usePlayer();
  const { popupContentObject, hidePopup } = usePopup();
  const { hasValidToken, checkTokenAndShowAuthIfNeeded, showAuthPopup } = useSpotifyAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchSubmitted, setSearchSubmitted] = useState("");
  const previousAuthState = useRef(false);

  // Function to check authentication status
  const checkAuth = () => {
    const tokenValid = hasValidToken();

    // Track authentication state change for detecting sign-out
    const wasAuthenticated = previousAuthState.current;
    previousAuthState.current = tokenValid;

    if (tokenValid) {
      // Only update state if needed to avoid unnecessary renders
      if (!isAuthenticated) {
        setIsAuthenticated(true);
      }

      // If there's an auth popup visible, dismiss it
      if (popupContentObject?.type === "SpotifyAuthPopupContentObject") {
        hidePopup();
      }
    } else {
      // Update auth state to false
      if (isAuthenticated) {
        setIsAuthenticated(false);
      }

      // If this is a sign-out (transition from authenticated to not authenticated)
      if (wasAuthenticated) {
        showAuthPopup(); // Immediately show the auth popup
      } else {
        // Regular case - not signed in yet
        checkTokenAndShowAuthIfNeeded(false); // Pass false for non-blocking mode
      }
    }
  };

  // Initial authentication check on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Set up a timer effect to periodically check token validity
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkAuth();
    }, 60000); // Check every minute

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, popupContentObject, hasValidToken, checkTokenAndShowAuthIfNeeded, showAuthPopup, hidePopup]);

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
            <GenrePlaylistsProvider>
              <Routes>
                <Route path="/" element={<AuthenticatedApp />} />
                <Route path="/auth/spotify/callback" element={<SpotifyCallback />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </GenrePlaylistsProvider>
          </TrackListSidebarVisibilityProvider>
        </PageProvider>
      </ApiErrorHandler>
    </Router>
  );
}
