import { useContext } from "react";
import { GenrePlaylistsContext } from "./GenrePlaylistsContext";

export function useGenrePlaylists() {
  return useContext(GenrePlaylistsContext);
}
