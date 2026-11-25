"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { PATHS, REGION_MAP_HREF } from "@lib/constants/routes";
import { mapEntityHref } from "@lib/searchHrefs";

function SongLink({ song }: { song: { uuid: string; title: string } }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const href = pathname === REGION_MAP_HREF ? mapEntityHref("song", song.uuid, searchParams) : PATHS.SONG(song.uuid);
  return (
    <Link href={href} className="hover:underline">
      {song.title}
    </Link>
  );
}

/** On the map a song opens in the map's own panel; elsewhere it goes to its page. */
export function renderSongLink(song: { uuid: string; title: string }) {
  return <SongLink song={song} />;
}
