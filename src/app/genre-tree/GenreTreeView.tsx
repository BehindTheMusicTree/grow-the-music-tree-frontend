"use client";

import { useState } from "react";

import { CriteriaPlaylistSimple } from "@domain/playlist/criteria-playlist/simple";
import { CriteriaMinimum } from "@schemas/domain/criteria/response/minimum";
import { CriteriaDetailed } from "@schemas/domain/criteria/response/detailed";

import GenrePlaylistTreePerRoot from "./playlist-tree/TreePerRoot";
import { GenreTreeSkeleton } from "./Skeleton";
import { getRootTreeColor } from "./playlist-tree/constants";

type GenreTreeViewProps = {
  groupedGenrePlaylistsByRoot: Record<string, CriteriaPlaylistSimple[]>;
  isLoading: boolean;
  actions: React.ReactNode;
  handleGenreCreationAction: (parent: CriteriaMinimum | null) => void;
};

export function GenreTreeView({
  groupedGenrePlaylistsByRoot,
  isLoading,
  actions,
  handleGenreCreationAction,
}: GenreTreeViewProps) {
  const [genreGettingAssignedNewParent, setGenreGettingAssignedNewParent] = useState<CriteriaDetailed | null>(null);

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
