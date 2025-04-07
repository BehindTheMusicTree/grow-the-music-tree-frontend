import { useContext } from "react";
import { SpotifyLibraryContext } from "./SpotifyLibraryContext";

export function useSpotifyLibTracks() {
  return useContext(SpotifyLibraryContext);
}
