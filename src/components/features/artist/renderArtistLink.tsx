"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { PATHS, REGION_MAP_HREF } from "@lib/constants/routes";
import { mapEntityHref } from "@lib/searchHrefs";

function ArtistLink({ artist }: { artist: { uuid: string; name: string } }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const href = pathname === REGION_MAP_HREF ? mapEntityHref("artist", artist.uuid, searchParams) : PATHS.ARTIST(artist.uuid);
  return (
    <Link href={href} className="hover:underline">
      {artist.name}
    </Link>
  );
}

/** On the map an artist opens in the map's own panel; elsewhere it goes to its page. */
export function renderArtistLink(artist: { uuid: string; name: string; isSpecialPurpose?: boolean }) {
  if (artist.isSpecialPurpose) return artist.name;
  return <ArtistLink artist={artist} />;
}
