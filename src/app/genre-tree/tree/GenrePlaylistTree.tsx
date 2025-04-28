"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";

import { usePopup } from "@contexts/PopupContext";
import { useTrackList } from "@contexts/TrackListContext";
import { useUpdateGenre, useCreateGenre, useDeleteGenre } from "@hooks/useGenre";
import { useUploadTrack } from "@hooks/useUploadedTrack";
import { usePlayer } from "@contexts/PlayerContext";
import { useGenreGettingAssignedNewParent } from "@contexts/GenreGettingAssignedNewParentContext";

import { PlayStates } from "@models/PlayStates";
import { TrackListOriginType } from "@models/track-list/origin/TrackListOriginType";

import { GenrePlaylistSimple } from "@domain/genre-playlist";
import TrackUploadPopup from "@components/ui/popup/child/TrackUploadPopup";
import { UploadedTrackCreationValues } from "@domain/uploaded-track/form";
import { GenreUpdateValues } from "@domain/genre/form";
import InvalidInputPopup from "@components/ui/popup/child/InvalidInputPopup";

import { buildTreeHierarchy } from "./TreeNodeHelper";
import { calculateSvgDimensions, createTreeLayout, setupTreeLayout, renderTree } from "./D3TreeRenderer";

type GenrePlaylistTreeProps = {
  genrePlaylistTree: GenrePlaylistSimple[];
};

export default function GenrePlaylistTree({ genrePlaylistTree }: GenrePlaylistTreeProps) {
  const { isPlaying, setIsPlaying } = usePlayer();
  const { showPopup } = usePopup();
  const { toTrackAtPosition, trackList } = useTrackList();
  const { mutate: uploadTrack, isPending: isUploadingTrack, error: uploadTrackError } = useUploadTrack();
  const { mutate: createGenre } = useCreateGenre();
  const { mutate: updateGenre } = useUpdateGenre();
  const { mutate: deleteGenre } = useDeleteGenre();
  const [
    previousRenderingVisibleActionsContainerGenrePlaylist,
    setPreviousRenderingVisibleActionsContainerGenrePlaylistUuid,
  ] = useState<GenrePlaylistSimple | null>(null);
  const { genreGettingAssignedNewParent, setGenreGettingAssignedNewParent } = useGenreGettingAssignedNewParent();
  const [svgWidth, setSvgWidth] = useState(0);
  const [svgHeight, setSvgHeight] = useState(0);

  const svgRef = useRef<SVGSVGElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectingFileGenreUuidRef = useRef<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const file = files[0];
      if (file) {
        const uploadedTrackCreationValues: UploadedTrackCreationValues = {
          file: file,
          genre: selectingFileGenreUuidRef.current,
        };
        uploadTrack(uploadedTrackCreationValues);

        showPopup(<TrackUploadPopup isUploadingTrack={isUploadingTrack} error={uploadTrackError} />);
      }
    }
    event.target.value = "";
  };

  const handlePlayPauseIconAction = useCallback(
    (genrePlaylist: GenrePlaylistSimple) => {
      if (
        !trackList ||
        !isPlaying ||
        trackList.origin.type !== TrackListOriginType.PLAYLIST ||
        trackList.origin.uuid !== genrePlaylist.uuid
      ) {
        if (genrePlaylist.uploadedTracksCount > 0) {
          toTrackAtPosition(0);
        }
      } else if (
        trackList &&
        trackList.origin.type === TrackListOriginType.PLAYLIST &&
        trackList.origin.uuid === genrePlaylist.uuid
      ) {
        setIsPlaying(!isPlaying);
      }
    },
    [trackList, isPlaying, toTrackAtPosition, setIsPlaying]
  );

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear any previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Build tree hierarchy
    const root = buildTreeHierarchy(d3, genrePlaylistTree);

    // Create tree layout
    const treeData = createTreeLayout(d3, root);

    // Calculate dimensions
    const { svgWidth: width, svgHeight: height, highestVerticalCoordinate } = calculateSvgDimensions(d3, treeData);
    setSvgWidth(width);
    setSvgHeight(height);

    // Transform coordinates for SVG
    const transformedTreeData = setupTreeLayout(d3, treeData, highestVerticalCoordinate);

    const updateGenreParent = async (genreUuid: string, parentUuid: string) => {
      updateGenre.mutate({ uuid: genreUuid, data: { parent: parentUuid } });
    };

    const handleRenameGenre = async (genreUuid: string, newName: string) => {
      try {
        updateGenre.mutate({ uuid: genreUuid, data: { name: newName } });
      } catch (error: unknown) {
        if (error && typeof error === "object" && "code" in error && error.code === 2001) {
          showPopup(
            <InvalidInputPopup
              details={{
                message: "Invalid genre name",
                fieldErrors: { name: [{ message: "This name is already taken", code: "2001" }] },
              }}
            />
          );
        }
      }
    };

    // Render the tree
    const svg = renderTree(d3, svgRef, transformedTreeData, width, height, {
      previousRenderingVisibleActionsContainerGenrePlaylist,
      genreUuidGettingAssignedNewParent: genreGettingAssignedNewParent?.uuid || null,
      forbiddenNewParentsUuids: [],
      trackListOrigin: trackList?.origin,
      playState: isPlaying ? PlayStates.PLAYING : PlayStates.STOPPED,
      handlePlayPauseIconAction,
      fileInputRef,
      selectingFileGenreUuidRef,
      createGenre,
      setGenreGettingAssignedNewParent,
      updateGenreParent,
      handleRenameGenre,
      showPopup,
      setPreviousRenderingVisibleActionsContainerGenrePlaylistUuid,
    });

    // Cleanup on unmount
    return () => {
      if (svg) {
        svg.selectAll("*").remove();
      }
    };
  }, [
    genrePlaylistTree,
    isPlaying,
    trackList?.origin,
    genreGettingAssignedNewParent,
    previousRenderingVisibleActionsContainerGenrePlaylist,
    svgWidth,
    svgHeight,
    createGenre,
    handlePlayPauseIconAction,
    setGenreGettingAssignedNewParent,
    updateGenre,
    showPopup,
  ]);

  return (
    <div>
      <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
      <svg ref={svgRef} width={svgWidth} height={svgHeight} className="mt-5"></svg>
    </div>
  );
}
