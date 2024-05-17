import { useContext } from "react";
import { PlayerTrackObjectContext } from "./PlayerLibTrackObjectContext";

export function usePlayerTrackObject() {
  return useContext(PlayerTrackObjectContext);
}
