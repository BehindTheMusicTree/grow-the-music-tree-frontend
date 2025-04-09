import { useState } from "react";
import PropTypes from "prop-types";

import { AuthProvider } from "@contexts/AuthContext";
import { PopupProvider, usePopup } from "@contexts/PopupContext";
import { UploadedTrackProvider } from "@contexts/UploadedTrackContext";
import { GenrePlaylistProvider } from "@contexts/GenrePlaylistContext";
import { PageProvider } from "@contexts/PageContext";
import { PlayerProvider, usePlayer } from "@contexts/PlayerContext";
import { TrackListSidebarVisibilityProvider } from "@contexts/TrackListSidebarVisibilityContext";
import { SpotifyLibraryProvider } from "@contexts/SpotifyLibraryContext";
import { NotificationProvider } from "@contexts/NotificationContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import Banner from "@components/banner/Banner";
import Menu from "@components/menu/Menu";
import PageContainer from "@components/page-container/PageContainer";
import Player from "@components/player/Player";
import Popup from "@components/popup/Popup";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
    },
  },
});

function MainLayout() {
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const { playerUploadedTrackObject } = usePlayer();
  const { popupContentObject } = usePopup();

  // Calculate dynamic heights based on player visibility
  const centerMaxHeight = {
    centerWithPlayer: "calc(100vh - 180px)", // Assuming banner is 100px and player is 80px
    centerWithoutPlayer: "calc(100vh - 100px)", // Only accounting for banner
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

export function AppLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PopupProvider>
          <PlayerProvider>
            <TrackListSidebarVisibilityProvider>
              <PageProvider>
                <UploadedTrackProvider>
                  <GenrePlaylistProvider>
                    <SpotifyLibraryProvider>
                      <NotificationProvider>
                        <MainLayout />
                        <ReactQueryDevtools initialIsOpen={false} />
                      </NotificationProvider>
                    </SpotifyLibraryProvider>
                  </GenrePlaylistProvider>
                </UploadedTrackProvider>
              </PageProvider>
            </TrackListSidebarVisibilityProvider>
          </PlayerProvider>
        </PopupProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
