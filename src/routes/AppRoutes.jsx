import { Routes, Route } from "react-router-dom";
import { Home } from "@pages/Home";
import { Upload } from "@pages/Upload";
import { GenrePlaylists } from "@pages/GenrePlaylists";
import { NotFound } from "@pages/NotFound";
import { ProtectedRoute } from "@components/auth/ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <Upload />
          </ProtectedRoute>
        }
      />
      <Route
        path="/genre-playlists"
        element={
          <ProtectedRoute>
            <GenrePlaylists />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
