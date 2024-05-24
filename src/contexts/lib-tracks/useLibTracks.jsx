import { useContext } from "react";
import { LibTracksContext } from "./LibTracksContext";

export function useLibTracks() {
  return useContext(LibTracksContext);
}
