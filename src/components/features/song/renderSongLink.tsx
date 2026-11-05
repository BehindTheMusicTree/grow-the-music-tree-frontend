import Link from "next/link";
import { PATHS } from "@lib/constants/routes";

export function renderSongLink(song: { uuid: string; title: string }) {
  return (
    <Link href={PATHS.SONG(song.uuid)} className="hover:underline">
      {song.title}
    </Link>
  );
}
