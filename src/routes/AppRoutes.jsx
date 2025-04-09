import { Routes, Route } from "react-router-dom";
import NotFoundPage from "@components/utils/NotFoundPage";
import SpotifyCallback from "@components/auth/SpotifyCallback";
import { AppLayout } from "@layouts/AppLayout";

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
