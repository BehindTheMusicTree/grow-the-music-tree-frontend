import { useContext } from "react";
import { SpotifyLibraryContext } from "./SpotifyLibraryContext";

export function useSpotifyLibrary() {
  return useContext(SpotifyLibraryContext);
}
