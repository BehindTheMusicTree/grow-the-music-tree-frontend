import { redirect } from "next/navigation";
import { ABOUT_HREF } from "@lib/constants/routes";

export default function AboutPage() {
  redirect(ABOUT_HREF);
}
