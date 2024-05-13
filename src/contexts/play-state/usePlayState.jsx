import { useContext } from "react";
import { PlayStateContext } from "./PlayStateContext";

export function usePlayState() {
  return useContext(PlayStateContext);
}
