"use client";

import { useCallback, useMemo } from "react";
import { GenreTree, getGenreTreeColor, type GenreTreeNode } from "@behindthemusictree/genre-tree-view";

import { usePopup } from "@contexts/PopupContext";
import { useTrackList } from "@contexts/TrackListContext";
import { useUpdateGenre } from "@hooks/useGenre";
import { useFetchGenrePlaylistDetailed } from "@hooks/useGenrePlaylist";
import { usePlayer } from "@contexts/PlayerContext";

import { TrackListOriginType } from "@models/track-list/origin/TrackListOriginType";

import TrackUploadPopup from "@components/ui/popup/child/TrackUploadPopup";
import InvalidInputPopup from "@components/ui/popup/child/InvalidInputPopup";
import GenreRenamePopup from "@components/ui/popup/child/GenreRenamePopup";
import { CriteriaPlaylistSimple } from "@domain/playlist/criteria-playlist/simple";
import { CriteriaMinimum } from "@domain/criteria/response/minimum";
import { Scope } from "@app-types/Scope";
import { useUploadTrack } from "@hooks/useUploadedTrack";

type GenrePlaylistTreePerRootProps = {
  scope: Scope;
  className?: string;
  rootUuid: string;
  genrePlaylistTreePerRoot: CriteriaPlaylistSimple[];
  reparentingGenreUuid: string | null;
  setReparentingGenreUuid: (uuid: string | null) => void;
  handleGenreCreationAction: (parent: CriteriaMinimum | null) => void;
};

export default function GenrePlaylistTreePerRoot({
  scope,
  className,
  rootUuid,
  genrePlaylistTreePerRoot,
  reparentingGenreUuid,
  setReparentingGenreUuid,
  handleGenreCreationAction,
}: GenrePlaylistTreePerRootProps) {
  const { isPlaying, setIsPlaying } = usePlayer();
  const { showPopup, hidePopup } = usePopup();
  const { trackList, playNewTrackListFromGenrePlaylist } = useTrackList();
  const { mutate: updateGenreMutate } = useUpdateGenre(scope);
  const { mutate: fetchGenrePlaylistDetailed } = useFetchGenrePlaylistDetailed(scope);
  const { mutateAsync: uploadedTrackMutateAsync } = useUploadTrack(scope);

  const nodes: GenreTreeNode[] = useMemo(
    () =>
      genrePlaylistTreePerRoot.map((genrePlaylist) => ({
        id: genrePlaylist.uuid,
        parentId: genrePlaylist.parent?.uuid ?? null,
        name: genrePlaylist.name,
        itemCount: genrePlaylist.uploadedTracksCount,
        actionable: Boolean(genrePlaylist.criteria),
      })),
    [genrePlaylistTreePerRoot],
  );

  const playingNodeId =
    trackList && trackList.origin.type === TrackListOriginType.PLAYLIST ? trackList.origin.uuid : null;

  const handlePlayPause = useCallback(
    (nodeId: string) => {
      const genrePlaylist = genrePlaylistTreePerRoot.find((g) => g.uuid === nodeId);
      if (!genrePlaylist) return;

      if (
        trackList &&
        (trackList.origin.type === TrackListOriginType.PLAYLIST ||
          trackList.origin.type === TrackListOriginType.GENRE_PLAYLIST) &&
        trackList.origin.uuid === genrePlaylist.uuid
      ) {
        setIsPlaying(!isPlaying);
        return;
      }

      if (genrePlaylist.uploadedTracksCount === 0) {
        return;
      }

      fetchGenrePlaylistDetailed(genrePlaylist.uuid, {
        onSuccess: (detailedPlaylist) => {
          playNewTrackListFromGenrePlaylist(detailedPlaylist, scope);
        },
        onError: (error) => {
          console.error("Failed to fetch detailed genre playlist:", error);
        },
      });
    },
    [genrePlaylistTreePerRoot, trackList, isPlaying, setIsPlaying, playNewTrackListFromGenrePlaylist, fetchGenrePlaylistDetailed, scope],
  );

  const handleAddChild = useCallback(
    (parentId: string) => {
      const genrePlaylist = genrePlaylistTreePerRoot.find((g) => g.uuid === parentId);
      if (!genrePlaylist?.criteria) return;
      handleGenreCreationAction(genrePlaylist.criteria);
    },
    [genrePlaylistTreePerRoot, handleGenreCreationAction],
  );

  const handleRenameRequest = useCallback(
    (node: GenreTreeNode) => {
      const genrePlaylist = genrePlaylistTreePerRoot.find((g) => g.uuid === node.id);
      if (!genrePlaylist?.criteria) return;
      const genre = genrePlaylist.criteria;

      showPopup(
        <GenreRenamePopup
          genre={genre}
          onSubmit={({ name }) => {
            updateGenreMutate(
              { uuid: genre.uuid, data: { name } },
              {
                onSuccess: () => {
                  hidePopup();
                },
                onError: (error: unknown) => {
                  if (error && typeof error === "object" && "code" in error && (error as { code: number }).code === 2001) {
                    showPopup(
                      <InvalidInputPopup
                        details={{
                          message: "Invalid genre name",
                          fieldErrors: { name: [{ message: "This name is already taken", code: "2001" }] },
                        }}
                      />,
                    );
                  }
                },
              },
            );
          }}
          onClose={hidePopup}
        />,
      );
    },
    [genrePlaylistTreePerRoot, updateGenreMutate, showPopup, hidePopup],
  );

  const handleDeleteRequest = useCallback((node: GenreTreeNode) => {
    if (confirm(`Are you sure you want to delete "${node.name}"?`)) {
      // TODO: Implement delete genre
    }
  }, []);

  const handleReparentRequest = useCallback(
    (node: GenreTreeNode) => {
      setReparentingGenreUuid(node.id);
    },
    [setReparentingGenreUuid],
  );

  const handleReparent = useCallback(
    (nodeId: string, newParentId: string) => {
      updateGenreMutate(
        { uuid: nodeId, data: { parent: newParentId } },
        {
          onSuccess: () => {
            setReparentingGenreUuid(null);
          },
        },
      );
    },
    [updateGenreMutate, setReparentingGenreUuid],
  );

  const handleUploadFiles = useCallback(
    (nodeId: string, files: File[]) => {
      showPopup(
        <TrackUploadPopup
          files={files}
          genre={nodeId}
          onProcessFile={(file, genre) => uploadedTrackMutateAsync({ file, genre })}
          onComplete={() => {}}
          onClose={hidePopup}
        />,
      );
    },
    [showPopup, hidePopup, uploadedTrackMutateAsync],
  );

  return (
    <GenreTree
      className={className}
      nodes={nodes}
      rootColor={getGenreTreeColor(rootUuid)}
      playingNodeId={playingNodeId}
      playState={isPlaying ? "playing" : "paused"}
      reparentingNodeId={reparentingGenreUuid}
      onPlayPause={handlePlayPause}
      onAddChild={handleAddChild}
      onRenameRequest={handleRenameRequest}
      onDeleteRequest={handleDeleteRequest}
      onReparentRequest={handleReparentRequest}
      onReparent={handleReparent}
      onUploadFiles={handleUploadFiles}
    />
  );
}
