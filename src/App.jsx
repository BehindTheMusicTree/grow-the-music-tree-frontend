import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Howler } from "howler";

import { PageProvider } from "./contexts/page/PageContext";
import { TrackListSidebarVisibilityProvider } from "./contexts/track-list-sidebar-visibility/TrackListSidebarVisibilityContext";
import { GenrePlaylistsProvider } from "./contexts/genre-playlists/GenrePlaylistsContext";
import { SpotifyLibraryProvider } from "./contexts/spotify-library/SpotifyLibraryContext";
import { AuthProvider } from "@contexts/AuthContext";
import { NotificationProvider } from "./contexts/notification/NotificationContext";
import { PopupProvider } from "./contexts/popup/PopupContext";
import { PlayerProvider } from "./contexts/player/PlayerContext";
import { TrackListProvider } from "./contexts/track-list/TrackListContext";
import { UploadedTracksProvider } from "./contexts/uploaded-tracks/UploadedTracksContext";

import { usePlayer } from "./contexts/player/usePlayer";
import { usePopup } from "./contexts/popup/usePopup";

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
 * Main layout component that provides the application structure
 * Includes banner, menu, page container, player and popup components
 */
function AppLayout() {
  const { playerUploadedTrackObject } = usePlayer();
  const { popupContentObject } = usePopup();
  const [searchSubmitted, setSearchSubmitted] = useState("");

  const centerMaxHeight = {
    centerWithoutPlayer: "calc(100% - 100px)",
    centerWithPlayer: "calc(100% - 180px)",
  };

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
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <PopupProvider>
            <ApiErrorHandler>
              <PlayerProvider>
                <TrackListProvider>
                  <UploadedTracksProvider>
                    <PageProvider>
                      <TrackListSidebarVisibilityProvider>
                        <GenrePlaylistsProvider>
                          <SpotifyLibraryProvider>
                            <Routes>
                              <Route path="/" element={<AppLayout />} />
                              <Route path="/genre-playlists" element={<AppLayout />} />
                              <Route path="/uploaded-library" element={<AppLayout />} />
                              <Route path="/spotify-library" element={<AppLayout />} />
                              <Route path="/auth/spotify/callback" element={<SpotifyCallback />} />
                              <Route path="*" element={<NotFoundPage />} />
                            </Routes>
                          </SpotifyLibraryProvider>
                        </GenrePlaylistsProvider>
                      </TrackListSidebarVisibilityProvider>
                    </PageProvider>
                  </UploadedTracksProvider>
                </TrackListProvider>
              </PlayerProvider>
            </ApiErrorHandler>
          </PopupProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}
