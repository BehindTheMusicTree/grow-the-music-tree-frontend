import { useContext } from "react";
import { RefreshGenresSignalContext } from "./RefreshGenresSignalContext";

export function useRefreshGenresSignal() {
  return useContext(RefreshGenresSignalContext);
}
