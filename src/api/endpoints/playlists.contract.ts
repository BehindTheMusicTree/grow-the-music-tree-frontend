export const GENRE_PLAYLISTS_KEY = "genrePlaylists";
export const FULL_GENRE_PLAYLISTS_KEY = "fullGenrePlaylists";
export const REFERENCE_GENRE_PLAYLISTS_KEY = "referenceGenrePlaylists";

export const playlistEndpoints = {
  list: (isReference = false) => (isReference ? "reference-genre-playlists/" : "genre-playlists/"),
  detail: (uuid: string, isReference = false) =>
    isReference ? `reference-genre-playlists/${uuid}` : `genre-playlists/${uuid}`,
};
