import { useContext } from "react";
import { GenreGettingAssignedNewParentContext } from "./GenreGettingAssignedNewParentContext";

export function useGenreGettingAssignedNewParent() {
  return useContext(GenreGettingAssignedNewParentContext);
}
