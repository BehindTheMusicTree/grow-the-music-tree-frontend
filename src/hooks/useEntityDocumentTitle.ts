import { useEffect } from "react";
import { useArtist, useSong } from "@behindthemusictree/app-kit/genre-tree";
import { APP_NAME } from "@lib/constants/app";
import { getGrowBackendBaseUrl } from "@lib/site-urls";

function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    if (!title) return undefined;
    const apply = () => {
      if (document.title !== title) document.title = title;
    };
    apply();
    // Next re-commits the layout's <title> after a client navigation, later than this effect.
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => {
      observer.disconnect();
      document.title = APP_NAME;
    };
  }, [title]);
}

/** Titles the page after the open artist or song, so shared and bookmarked links read well. */
export function useEntityDocumentTitle(artistUuid: string | null, songUuid: string | null) {
  const artist = useArtist(artistUuid, getGrowBackendBaseUrl);
  const song = useSong(songUuid, getGrowBackendBaseUrl);
  const artistName = artist.status === "success" ? artist.artist.name : undefined;
  const songTitle = song.status === "success" ? song.song.title : undefined;
  const songArtists =
    song.status === "success" ? song.song.artists?.map((songArtist) => songArtist.name).join(", ") : undefined;
  const songFullTitle = songTitle && (songArtists ? `${songTitle} — ${songArtists}` : songTitle);
  // One observer only: two with different titles would rewrite each other forever.
  useDocumentTitle(songFullTitle || artistName);
}
