import { useState, useEffect, useRef, useCallback } from "react";
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

Howler.autoUnlock = true;

/**
 * Wrapper component that checks for Spotify authentication
 * Now supports non-blocking operation with notifications
 */
function AuthenticatedApp() {
  const { playerUploadedTrackObject } = usePlayer();
  const { popupContentObject, hidePopup } = usePopup();
  const { hasValidToken, showAuthPopup } = useSpotifyAuth();
  const [searchSubmitted, setSearchSubmitted] = useState("");
  const previousAuthState = useRef(false);
  const popupRef = useRef(popupContentObject);
  const checkAuthCallCount = useRef(0);

  // Update popup ref without an effect
  popupRef.current = popupContentObject;

  // Memoize the checkAuth function to prevent it from recreating on every render
  const checkAuth = useCallback(() => {
    checkAuthCallCount.current++;

    const tokenValid = hasValidToken();

    // Track authentication state change
    const wasAuthenticated = previousAuthState.current;
    previousAuthState.current = tokenValid;

    if (tokenValid) {
      // If there's an auth popup visible, dismiss it
      if (popupRef.current?.type === "SpotifyAuthPopupContentObject") {
        hidePopup();
      }
    } else {
      // If this is a sign-out (transition from authenticated to not authenticated)
      if (wasAuthenticated) {
        showAuthPopup(); // Immediately show the auth popup
      }
      // Don't call checkTokenAndShowAuthIfNeeded here as it can cause a loop
    }
  }, [hasValidToken, hidePopup, showAuthPopup]);

  // Check authentication on component mount and set up interval
  useEffect(() => {
    // Initial check
    checkAuth();

    // Set up interval to periodically check token validity
    const authCheckInterval = setInterval(checkAuth, 60000); // Check every minute

    return () => {
      clearInterval(authCheckInterval);
    };
  }, [checkAuth]);

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
