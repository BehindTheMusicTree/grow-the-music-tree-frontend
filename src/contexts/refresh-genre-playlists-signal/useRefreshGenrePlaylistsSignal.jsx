import { useContext } from "react";
import { RefreshGenrePlaylistsSignalContext } from "./RefreshGenrePlaylistsSignalContext";

export function useRefreshGenrePlaylistsSignal() {
  return useContext(RefreshGenrePlaylistsSignalContext);
}
