import { useContext } from "react";
import { UploadedTracksContext } from "./UploadedTracksContext";

export function useUploadedTracks() {
  return useContext(UploadedTracksContext);
}
