import { CriteriaPlaylistSimple } from "@domain/playlist/criteria-playlist/simple";

export const getGenrePlaylistsGroupedByRoot = (genrePlaylists: CriteriaPlaylistSimple[]) =>
  genrePlaylists.reduce<Record<string, CriteriaPlaylistSimple[]>>((acc, playlist) => {
    const rootUuid = playlist.root.uuid;
    if (!acc[rootUuid]) acc[rootUuid] = [];
    acc[rootUuid].push(playlist);
    return acc;
  }, {});
