"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as d3 from "d3";

import { usePopup } from "@contexts/PopupContext";
import { useTrackList } from "@contexts/TrackListContext";
import { useUpdateGenre, useCreateGenre, useDeleteGenre } from "@hooks/useGenre";
import { useUploadTrack } from "@hooks/useUploadedTrack";
import { usePlayer } from "@contexts/PlayerContext";

import { PlayStates } from "@models/PlayStates";
import { TrackListOriginType } from "@models/track-list/origin/TrackListOriginType";

import TrackUploadPopup from "@components/ui/popup/child/TrackUploadPopup";
import InvalidInputPopup from "@components/ui/popup/child/InvalidInputPopup";
import { UploadedTrackCreationValues } from "@domain/uploaded-track/form/creation";
import { CriteriaPlaylistSimple } from "@domain/playlist/criteria-playlist/simple";
import { CriteriaMinimum } from "@domain/criteria/response/minimum";

import { buildTreeHierarchyStructure } from "./TreeNodeHelper";
import { calculateSvgDimensions, createTreeLayout, setupTreeLayout, renderTree } from "./D3TreeRenderer";

type GenrePlaylistTreePerRootProps = {
  className?: string;
  genrePlaylistTreePerRoot: CriteriaPlaylistSimple[];
  genrePlaylistGettingAssignedNewParent: CriteriaPlaylistSimple | null;
  setGenrePlaylistGettingAssignedNewParent: (genrePlaylist: CriteriaPlaylistSimple | null) => void;
  handleGenreCreationAction: (parent: CriteriaMinimum | null) => void;
};

export default function GenrePlaylistTreePerRoot({
  className,
  genrePlaylistTreePerRoot,
  genrePlaylistGettingAssignedNewParent,
  setGenrePlaylistGettingAssignedNewParent,
  handleGenreCreationAction,
}: GenrePlaylistTreePerRootProps) {
  const [forbiddenNewParentsUuids, setForbiddenNewParentsUuids] = useState<string[]>([]);
  const { isPlaying, setIsPlaying } = usePlayer();
  const { showPopup } = usePopup();
  const { toTrackAtPosition, trackList } = useTrackList();
  const { mutate: uploadTrack, isPending: isUploadingTrack, error: uploadTrackError } = useUploadTrack();
  const { mutate: createGenre } = useCreateGenre();
  const { renameGenre, updateGenreParent } = useUpdateGenre();
  const { mutate: deleteGenre } = useDeleteGenre();
  const [
    previousRenderingVisibleActionsContainerGenrePlaylist,
    setPreviousRenderingVisibleActionsContainerGenrePlaylist,
  ] = useState<CriteriaPlaylistSimple | null>(null);
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
    (genrePlaylist: CriteriaPlaylistSimple) => {
      console.log("handlePlayPauseIconAction", genrePlaylist);
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

  const { treeData } = useMemo(() => {
    // Build tree hierarchy
    const root = buildTreeHierarchyStructure(d3, genrePlaylistTreePerRoot);

    // Create tree layout
    const originalTreeData = createTreeLayout(d3, root);

    // Calculate dimensions
    const {
      svgWidth: width,
      svgHeight: height,
      highestVerticalCoordinate,
    } = calculateSvgDimensions(d3, originalTreeData);
    setSvgWidth(width);
    setSvgHeight(height);

    // Transform coordinates for SVG
    const reshapedTreeData = setupTreeLayout(d3, originalTreeData, highestVerticalCoordinate);

    return { treeData: reshapedTreeData };
  }, [genrePlaylistTreePerRoot]);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear any previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const updateGenreParent = async (genreUuid: string, parentUuid: string) => {
      updateGenreParent(genreUuid, parentUuid);
    };

    const handleRenameGenre = async (genreUuid: string, newName: string) => {
      try {
        renameGenre(genreUuid, newName);
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

    renderTree(
      d3,
      svgRef,
      treeData,
      svgWidth,
      svgHeight,
      previousRenderingVisibleActionsContainerGenrePlaylist,
      genrePlaylistGettingAssignedNewParent,
      forbiddenNewParentsUuids,
      trackList ? trackList.origin : null,
      isPlaying ? PlayStates.PLAYING : PlayStates.STOPPED,
      fileInputRef,
      selectingFileGenreUuidRef,
      {
        setForbiddenNewParentsUuids,
        handlePlayPauseIconAction,
        handleGenreCreationAction,
        setGenrePlaylistGettingAssignedNewParent,
        updateGenreParent,
        handleRenameGenre,
        showPopup,
        setPreviousRenderingVisibleActionsContainerGenrePlaylist,
      }
    );
  }, [
    genrePlaylistTreePerRoot,
    isPlaying,
    trackList?.origin,
    genrePlaylistGettingAssignedNewParent,
    forbiddenNewParentsUuids,
    trackList,
    previousRenderingVisibleActionsContainerGenrePlaylist,
    svgWidth,
    svgHeight,
    treeData,
    createGenre,
    handlePlayPauseIconAction,
    setGenrePlaylistGettingAssignedNewParent,
    updateGenreParent,
    showPopup,
    handleGenreCreationAction,
    renameGenre,
  ]);

  useEffect(() => {
    const svgElement = svgRef.current;
    return () => {
      if (svgElement) {
        d3.select(svgElement).selectAll("*").remove();
      }
    };
  }, []);

  return (
    <div className={className}>
      <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
      <svg ref={svgRef} width={svgWidth} height={svgHeight} className="mt-5"></svg>
    </div>
  );
}
