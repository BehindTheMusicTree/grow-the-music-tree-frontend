"use client";

import { useMemo } from "react";
import { FaTree } from "react-icons/fa";
import { IconTextButton } from "@components/ui/IconTextButton";

import { useListFullGenrePlaylists } from "@hooks/useGenrePlaylist";
import { useLoadPublicReferenceTreeGenre } from "@hooks/useGenre";
import { CriteriaPlaylistSimple } from "@domain/playlist/criteria-playlist/simple";
import { getGenrePlaylistsGroupedByRoot } from "@lib/genre-playlist-helpers";

import { GenreTreeView } from "../me-genre-tree/GenreTreeView";

export default function ReferenceGenreTree() {
  const { data: genrePlaylists, isPending: isListingGenrePlaylists } = useListFullGenrePlaylists("reference");
  const { mutate: loadReferenceTreeGenre, isPending: isLoadingReferenceTreeGenre } =
    useLoadPublicReferenceTreeGenre("reference");

  const groupedGenrePlaylistsByRoot = useMemo(
    () =>
      genrePlaylists?.results ? getGenrePlaylistsGroupedByRoot(genrePlaylists.results as CriteriaPlaylistSimple[]) : {},
    [genrePlaylists?.results],
  );

  return (
    <GenreTreeView
      groupedGenrePlaylistsByRoot={groupedGenrePlaylistsByRoot}
      isLoading={isLoadingReferenceTreeGenre || isListingGenrePlaylists}
      handleGenreCreationAction={() => {}}
      actions={
        <IconTextButton
          icon={FaTree}
          text="Load the example tree genre"
          onClick={() => loadReferenceTreeGenre()}
          disabled={isLoadingReferenceTreeGenre || isListingGenrePlaylists}
        />
      }
    />
  );
}
