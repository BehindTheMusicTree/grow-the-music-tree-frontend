"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";

import { usePopup } from "@contexts/PopupContext";
import { useTrackList } from "@contexts/TrackListContext";
import { useUpdateGenre, useCreateGenre, useDeleteGenre } from "@hooks/useGenre";
import { usePlayer } from "@contexts/PlayerContext";
import { useGenreGettingAssignedNewParent } from "@contexts/GenreGettingAssignedNewParentContext";

import { PlayStates } from "@models/PlayStates";
import { TrackListOriginType } from "@models/track-list/origin/TrackListOriginType";

import { buildTreeHierarchy } from "./TreeNodeHelper";
import { calculateSvgDimensions, createTreeLayout, setupTreeLayout, renderTree } from "./D3TreeRenderer.js";

/**
 * Component that renders a D3 tree visualization of genre playlists
 */
export default function GenrePlaylistTree({ genrePlaylistTree }) {
  const { playState, handlePlayPauseAction } = usePlayer();
  const { showPopup } = usePopup();
  const { playNewTrackListFromPlaylistUuid, origin: trackListOrigin } = useTrackList();
  const { mutate: createGenre } = useCreateGenre();
  const { mutate: updateGenre } = useUpdateGenre();
  const { mutate: deleteGenre } = useDeleteGenre();
  const [
    previousRenderingVisibleActionsContainerGenrePlaylist,
    setPreviousRenderingVisibleActionsContainerGenrePlaylistUuid,
  ] = useState(null);
  const { genreUuidGettingAssignedNewParent, forbiddenNewParentsUuids, setGenreGettingAssignedNewParent } =
    useGenreGettingAssignedNewParent();
  const [svgWidth, setSvgWidth] = useState(0);
  const [svgHeight, setSvgHeight] = useState(0);

  const svgRef = useRef(null);
  const fileInputRef = useRef(null);
  const selectingFileGenreUuidRef = useRef(null);

  /**
   * Handles file selection for track upload
   */
  async function handleFileChange(event) {
    showPopup("trackUpload", {
      files: event.target.files,
      genreUuid: selectingFileGenreUuidRef.current,
    });
    event.target.value = null;
  }

  const handlePlayPauseIconAction = useCallback(
    (genrePlaylist) => {
      if (
        !trackListOrigin ||
        playState === PlayStates.STOPPED ||
        trackListOrigin.type !== TrackListOriginType.PLAYLIST ||
        trackListOrigin.object.uuid !== genrePlaylist.uuid
      ) {
        if (genrePlaylist.uploadedTracksCount > 0) {
          playNewTrackListFromPlaylistUuid(genrePlaylist.uuid);
        }
      } else if (
        trackListOrigin &&
        trackListOrigin.type === TrackListOriginType.PLAYLIST &&
        trackListOrigin.object.uuid === genrePlaylist.uuid
      ) {
        handlePlayPauseAction();
      }
    },
    [trackListOrigin, playState, playNewTrackListFromPlaylistUuid, handlePlayPauseAction]
  );

  useEffect(() => {
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

    const updateGenreParent = async (genreUuid, parentUuid) => {
      await updateGenreParent(genreUuid, parentUuid);
    };

    const handleRenameGenre = async (genreUuid, newName) => {
      const result = await updateGenre({ uuid: genreUuid, data: { name: newName } });
      if (!result.success) {
        if (result.code === 2001) {
          showPopup("invalidInput", result);
        }
      }
    };

    // Render the tree
    const svg = renderTree(d3, svgRef, transformedTreeData, width, height, {
      previousRenderingVisibleActionsContainerGenrePlaylist,
      genreUuidGettingAssignedNewParent,
      forbiddenNewParentsUuids,
      trackListOrigin,
      playState,
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
    playState,
    trackListOrigin,
    genreUuidGettingAssignedNewParent,
    forbiddenNewParentsUuids,
    previousRenderingVisibleActionsContainerGenrePlaylist,
    svgWidth,
    svgHeight,
    createGenre,
    handlePlayPauseIconAction,
    setGenreGettingAssignedNewParent,
    updateGenreParent,
    showPopup,
    renameGenre,
  ]);

  return (
    <div>
      <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
      <svg ref={svgRef} width={svgWidth} height={svgHeight} className="mt-5"></svg>
    </div>
  );
}

GenrePlaylistTree.propTypes = {
  genrePlaylistTree: PropTypes.array.isRequired,
};
