import { Routes, Route, Navigate } from "react-router-dom";
import NotFoundPage from "@/app/not-found-jsx";
import SpotifyCallback from "@/app/spotify-callback/page";

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
