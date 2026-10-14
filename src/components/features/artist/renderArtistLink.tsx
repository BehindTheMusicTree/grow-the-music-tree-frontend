import Link from "next/link";
import { PATHS } from "@lib/constants/routes";

export function renderArtistLink(artist: { uuid: string; name: string; isSpecialPurpose?: boolean }) {
  if (artist.isSpecialPurpose) return artist.name;

  return (
    <Link href={PATHS.ARTIST(artist.uuid)} className="hover:underline">
      {artist.name}
    </Link>
  );
}
