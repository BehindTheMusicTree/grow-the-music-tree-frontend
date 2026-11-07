/** The tree keys `?genre=` by genre playlist uuid; null when the genre has no playlist in the tree. */
export const treeGenreHref = (genrePlaylistUuid: string | null) =>
  genrePlaylistUuid ? `/?genre=${encodeURIComponent(genrePlaylistUuid)}` : null;
