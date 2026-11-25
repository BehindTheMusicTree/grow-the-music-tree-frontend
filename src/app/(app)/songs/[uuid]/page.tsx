import { permanentRedirect } from "next/navigation";
import { PATHS } from "@lib/constants/routes";

type SongPageProps = { params: Promise<{ uuid: string }> };

// Songs open as a panel over the genre tree; this route keeps shared and indexed links working.
export default async function SongPage({ params }: SongPageProps) {
  permanentRedirect(PATHS.SONG((await params).uuid));
}
