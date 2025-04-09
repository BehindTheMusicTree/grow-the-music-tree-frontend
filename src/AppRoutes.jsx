import { Routes, Route } from "react-router-dom";
import { Howler } from "howler";

import Banner from "@components/banner/Banner";
import Menu from "@components/menu/Menu";
import PageContainer from "@components/page-container/PageContainer";
import Player from "@components/player/Player";
import Popup from "@components/popup/Popup";
import NotFoundPage from "@components/utils/NotFoundPage";
import SpotifyCallback from "@components/auth/SpotifyCallback";
import { usePlayer, usePopup } from "@contexts";

Howler.autoUnlock = true;

function AppLayout() {
  const { playerUploadedTrackObject } = usePlayer();
  const { popupContentObject } = usePopup();

  const centerMaxHeight = {
    centerWithoutPlayer: "calc(100% - 100px)",
    centerWithPlayer: "calc(100% - 180px)",
  };

  return (
    <div className="app flex flex-col h-screen">
      <Banner className="fixed top-0 z-50" />
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

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />} />
      <Route path="/genre-playlists" element={<AppLayout />} />
      <Route path="/uploaded-library" element={<AppLayout />} />
      <Route path="/spotify-library" element={<AppLayout />} />
      <Route path="/auth/spotify/callback" element={<SpotifyCallback />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
