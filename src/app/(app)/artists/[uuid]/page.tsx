import { permanentRedirect } from "next/navigation";
import { PATHS } from "@lib/constants/routes";

type ArtistPageProps = { params: Promise<{ uuid: string }> };

// Artists open as a panel over the genre tree; this route keeps shared and indexed links working.
export default async function ArtistPage({ params }: ArtistPageProps) {
  permanentRedirect(PATHS.ARTIST((await params).uuid));
}
