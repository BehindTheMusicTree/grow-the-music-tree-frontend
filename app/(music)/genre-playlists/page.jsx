"use client";

import { GenrePlaylistProvider } from "@/contexts/GenrePlaylistContext";
import GenrePlaylists from "@/components/genre-playlists/GenrePlaylists";

export default function GenrePlaylistsPage() {
  return (
    <GenrePlaylistProvider>
      <GenrePlaylists />
    </GenrePlaylistProvider>
  );
}
