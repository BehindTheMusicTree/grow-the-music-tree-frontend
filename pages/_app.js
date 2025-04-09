import { useState } from "react";
import Head from "next/head";
import { AuthProvider } from "@contexts/AuthContext";
import { PopupProvider } from "@contexts/PopupContext";
import { UploadedTrackProvider } from "@contexts/UploadedTrackContext";
import { GenrePlaylistProvider } from "@contexts/GenrePlaylistContext";
import { NextPageProvider } from "@contexts/NextPageContext";
import { PlayerProvider } from "@contexts/PlayerContext";
import { TrackListSidebarVisibilityProvider } from "@contexts/TrackListSidebarVisibilityContext";
import { SpotifyLibraryProvider } from "@contexts/SpotifyLibraryContext";
import { NotificationProvider } from "@contexts/NotificationContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import Banner from "@components/banner/Banner";
import Menu from "@components/menu/Menu";
import Player from "@components/player/Player";
import Popup from "@components/popup/Popup";

import "../src/index.css"; // Import global CSS

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
    },
  },
});

function AppLayout({ children }) {
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [playerUploadedTrackObject, setPlayerUploadedTrackObject] = useState(null);
  const [popupContentObject, setPopupContentObject] = useState(null);

  // Calculate dynamic heights based on player visibility
  const centerMaxHeight = {
    centerWithPlayer: "calc(100vh - 180px)", // Assuming banner is 100px and player is 80px
    centerWithoutPlayer: "calc(100vh - 100px)", // Only accounting for banner
  };

  return (
    <div className="app flex flex-col h-screen">
      <Banner className="fixed top-0 z-50" searchSubmitted={searchSubmitted} setSearchSubmitted={setSearchSubmitted} />

      <div
        className="center flex-grow flex overflow-y-auto"
        style={{
          maxHeight: playerUploadedTrackObject ? centerMaxHeight.centerWithPlayer : centerMaxHeight.centerWithoutPlayer,
        }}
      >
        <Menu />
        <main className="w-full">{children}</main>
      </div>

      {playerUploadedTrackObject && <Player />}
      {popupContentObject && <Popup />}
    </div>
  );
}

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Ultimate Music Guide</title>
        <meta name="description" content="Ultimate Music Guide - Your DJ companion" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PopupProvider>
            <PlayerProvider>
              <TrackListSidebarVisibilityProvider>
                <NextPageProvider>
                  <UploadedTrackProvider>
                    <GenrePlaylistProvider>
                      <SpotifyLibraryProvider>
                        <NotificationProvider>
                          <AppLayout>
                            <Component {...pageProps} />
                          </AppLayout>
                          <ReactQueryDevtools initialIsOpen={false} />
                        </NotificationProvider>
                      </SpotifyLibraryProvider>
                    </GenrePlaylistProvider>
                  </UploadedTrackProvider>
                </NextPageProvider>
              </TrackListSidebarVisibilityProvider>
            </PlayerProvider>
          </PopupProvider>
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}

export default MyApp;
