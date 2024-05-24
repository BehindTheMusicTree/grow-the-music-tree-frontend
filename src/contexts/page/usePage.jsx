import { useContext } from "react";
import { PageContext } from "./PageContext";

export function usePage() {
  return useContext(PageContext);
}
