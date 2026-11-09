import { useEffect } from "react";
import { useArtist, useSong } from "@behindthemusictree/app-kit/genre-tree";
import { getGrowBackendBaseUrl } from "@lib/site-urls";

function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    if (!title) return undefined;
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}

/** Titles the page after the open artist or song, so shared and bookmarked links read well. */
export function useEntityDocumentTitle(artistUuid: string | null, songUuid: string | null) {
  const artist = useArtist(artistUuid, getGrowBackendBaseUrl);
  useDocumentTitle(artist.status === "success" ? artist.artist.name : undefined);

  const song = useSong(songUuid, getGrowBackendBaseUrl);
  const songTitle = song.status === "success" ? song.song.title : undefined;
  const songArtists =
    song.status === "success" ? song.song.artists?.map((songArtist) => songArtist.name).join(", ") : undefined;
  useDocumentTitle(songTitle && (songArtists ? `${songTitle} — ${songArtists}` : songTitle));
}
