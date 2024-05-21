import { useContext } from "react";
import { PlayerContext } from "./PlayerContext";

export function usePlayer() {
  return useContext(PlayerContext);
}
