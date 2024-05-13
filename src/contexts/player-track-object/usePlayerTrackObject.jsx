import { useContext } from "react";
import { PlayerTrackObjectContext } from "./PlayerTrackObjectContext";

export function usePlayerTrackObject() {
  return useContext(PlayerTrackObjectContext);
}
