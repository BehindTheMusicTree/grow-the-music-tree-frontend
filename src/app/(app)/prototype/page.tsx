import { redirect } from "next/navigation";
import { PATHS } from "@lib/constants/routes";

export default function PrototypePage() {
  redirect(PATHS.PROTOTYPE_REFERENCE_GENRE_TREE);
}
