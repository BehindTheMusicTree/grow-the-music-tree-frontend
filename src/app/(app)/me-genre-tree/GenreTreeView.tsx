"use client";

import { useState, useMemo } from "react";
import { FaTree } from "react-icons/fa";
import { Plus } from "lucide-react";
import { IconTextButton } from "@components/ui/IconTextButton";

import { CriteriaPlaylistSimple } from "@domain/playlist/criteria-playlist/simple";
import { CriteriaMinimum } from "@schemas/domain/criteria/response/minimum";
import { CriteriaDetailed } from "@schemas/domain/criteria/response/detailed";
import { Scope } from "@app-types/Scope";
import { useListFullGenrePlaylists } from "@hooks/useGenrePlaylist";
import { useLoadExampleTreeGenre } from "@hooks/useGenre";
import { getGenrePlaylistsGroupedByRoot } from "@lib/genre-playlist-helpers";

import GenrePlaylistTreePerRoot from "./playlist-tree/TreePerRoot";
import { GenreTreeSkeleton } from "./Skeleton";
import { getRootTreeColor } from "./playlist-tree/constants";

type GenreTreeViewProps = {
  scope: Scope;
  handleGenreCreationAction: (parent: CriteriaMinimum | null) => void;
};

export function GenreTreeView({ scope, handleGenreCreationAction }: GenreTreeViewProps) {
  const [genreGettingAssignedNewParent, setGenreGettingAssignedNewParent] = useState<CriteriaDetailed | null>(null);

  const { data: genrePlaylists, isPending: isListingGenrePlaylists } = useListFullGenrePlaylists(scope);
  const loadTreeMutation = useLoadExampleTreeGenre(scope);
  const isLoadingTree = loadTreeMutation.isPending;

  const groupedGenrePlaylistsByRoot = useMemo(
    () =>
      genrePlaylists?.results ? getGenrePlaylistsGroupedByRoot(genrePlaylists.results as CriteriaPlaylistSimple[]) : {},
    [genrePlaylists?.results],
  );

  const isLoading = isListingGenrePlaylists || isLoadingTree;

  const loadButtonText = scope === "me" ? "Load the example tree genre" : "Load the reference tree genre";

  const actions = (
    <>
      <IconTextButton icon={Plus} text="Add root" onClick={() => handleGenreCreationAction(null)} />
      <IconTextButton
        icon={FaTree}
        text={loadButtonText}
        className="ml-2"
        onClick={() => loadTreeMutation.mutate()}
        disabled={isLoading}
      />
    </>
  );

  return (
    <div className="mt-4 flex flex-col h-screen">
      <div className="actions-container flex justify-start">
        <div className="flex justify-start">{actions}</div>
      </div>
      {isLoading ? (
        <GenreTreeSkeleton />
      ) : (
        <div className="tree-container flex flex-col gap-4 text-gray-800 w-full overflow-x-auto overflow-y-auto relative">
          {Object.entries(groupedGenrePlaylistsByRoot).map(([uuid, genrePlaylistTreePerRoot]) => {
            const rootColor = getRootTreeColor(uuid);
            return (
              <div
                key={uuid}
                className="tree-per-root-container relative mt-2 mr-16 p-2 bg-gray-50 rounded-lg inline-block w-fit"
              >
                <div className="tree-root-name-container absolute top-0 left-0 z-0">
                  <div className="text-9xl font-bold text-left" style={{ color: rootColor }}>
                    {genrePlaylistTreePerRoot[0].root.name}
                  </div>
                </div>
                <div className="graph-container relative z-10">
                  <GenrePlaylistTreePerRoot
                    scope={scope}
                    rootUuid={uuid}
                    genrePlaylistTreePerRoot={genrePlaylistTreePerRoot}
                    genreGettingAssignedNewParent={genreGettingAssignedNewParent}
                    setGenreGettingAssignedNewParent={setGenreGettingAssignedNewParent}
                    handleGenreCreationAction={handleGenreCreationAction}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
