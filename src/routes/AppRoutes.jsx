import { Routes, Route, Navigate } from "react-router-dom";
import NotFoundPage from "@components/utils/NotFoundPage";
import SpotifyCallback from "@components/auth/SpotifyCallback";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/genre-playlists" />} />
      <Route path="/genre-playlists" element={null} />
      <Route path="/uploaded-library" element={null} />
      <Route path="/spotify-library" element={null} />
      <Route path="/account" element={null} />
      <Route path="/auth/spotify/callback" element={<SpotifyCallback />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
