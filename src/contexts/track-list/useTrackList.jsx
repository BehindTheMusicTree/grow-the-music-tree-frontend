import { useContext } from "react";
import { TrackListContext } from "./TrackListContext";

export function useTrackList() {
  return useContext(TrackListContext);
}
