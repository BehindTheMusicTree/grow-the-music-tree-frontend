import { useContext } from "react";
import { TrackListSidebarVisibilityContext } from "./TrackListSidebarVisibilityContext";

export function useTrackListSidebarVisibility() {
  return useContext(TrackListSidebarVisibilityContext);
}
