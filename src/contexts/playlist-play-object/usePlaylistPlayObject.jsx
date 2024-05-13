import { useContext } from "react";
import { PlaylistPlayObjectContext } from "./PlaylistPlayObjectContext";

export function usePlaylistPlayObject() {
  return useContext(PlaylistPlayObjectContext);
}
