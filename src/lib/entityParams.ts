export const GENRE_PARAM = "genre";
export const ARTIST_PARAM = "artist";
export const SONG_PARAM = "song";
export const REGION_PARAM = "region";
export const TRADITION_PARAM = "tradition";

/** An absent or blank parameter names nothing, so Grow reads it as `null` and never hands `""` to a panel or an API path. */
export function readQueryParam(searchParams: Pick<URLSearchParams, "get">, key: string): string | null {
  const value = searchParams.get(key)?.trim();
  return value ? value : null;
}

export function readEntityParams(searchParams: Pick<URLSearchParams, "get">) {
  return {
    genre: readQueryParam(searchParams, GENRE_PARAM),
    artist: readQueryParam(searchParams, ARTIST_PARAM),
    song: readQueryParam(searchParams, SONG_PARAM),
    region: readQueryParam(searchParams, REGION_PARAM),
    tradition: readQueryParam(searchParams, TRADITION_PARAM),
  };
}
