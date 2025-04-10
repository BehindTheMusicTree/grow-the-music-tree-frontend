import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";

import { usePopup } from "@/app/contexts/PopupContext.jsx";
import { useTrackList } from "@/app/contexts/TrackListContext.jsx";
import { useGenrePlaylists } from "@contexts/GenrePlaylistContext";
import { usePlayer } from "@/app/contexts/PlayerContext.jsx";
import { useGenreGettingAssignedNewParent } from "@/app/contexts/GenreGettingAssignedNewParentContext.jsx";

import { PLAY_STATES, TRACK_LIST_ORIGIN_TYPE } from "@/app/lib/utils/constants.js";
import TrackUploadPopupContentObject from "@models/popup-content-object/TrackUploadPopupContentObject";
import GenreDeletionPopupContentObject from "@models/popup-content-object/GenreDeletionPopupContentObject";
import InvalidInputContentObject from "@models/popup-content-object/InvalidInputContentObject";
import ApiErrorPopupContentObject from "@models/popup-content-object/ApiErrorPopupContentObject";

import { buildTreeHierarchy } from "./TreeNodeHelper.jsx";
import { calculateSvgDimensions, createTreeLayout, setupTreeLayout, renderTree } from "./D3TreeRenderer.js";

/**
 * Component that renders a D3 tree visualization of genre playlists
 */
export default function GenrePlaylistsTree({ genrePlaylistsTree }) {
  const { playState, handlePlayPauseAction } = usePlayer();
  const { showPopup } = usePopup();
  const { handleGenreAddAction, updateGenreParent, renameGenre } = useGenrePlaylists();
  const { playNewTrackListFromPlaylistUuid, origin: trackListOrigin } = useTrackList();
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
    const popupContentObject = new TrackUploadPopupContentObject(
      Array.from(event.target.files),
      selectingFileGenreUuidRef.current
    );
    showPopup(popupContentObject);
    event.target.value = null;
  }

  /**
   * Handles play/pause action for a genre playlist
   */
  const handlePlayPauseIconAction = (genrePlaylist) => {
    if (
      !trackListOrigin ||
      playState === PLAY_STATES.STOPPED ||
      trackListOrigin.type !== TRACK_LIST_ORIGIN_TYPE.PLAYLIST ||
      trackListOrigin.object.uuid !== genrePlaylist.uuid
    ) {
      if (genrePlaylist.libraryTracksCount > 0) {
        playNewTrackListFromPlaylistUuid(genrePlaylist.uuid);
      }
    } else if (
      trackListOrigin &&
      trackListOrigin.type === TRACK_LIST_ORIGIN_TYPE.PLAYLIST &&
      trackListOrigin.object.uuid === genrePlaylist.uuid
    ) {
      handlePlayPauseAction();
    }
  };

  useEffect(() => {
    // Clear any previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Build tree hierarchy
    const root = buildTreeHierarchy(d3, genrePlaylistsTree);

    // Create tree layout
    const treeData = createTreeLayout(d3, root);

    // Calculate dimensions
    const { svgWidth: width, svgHeight: height, highestVerticalCoordinate } = calculateSvgDimensions(d3, treeData);
    setSvgWidth(width);
    setSvgHeight(height);

    // Transform coordinates for SVG
    const transformedTreeData = setupTreeLayout(d3, treeData, highestVerticalCoordinate);

    const updateGenreParent = async (genreUuid, parentUuid) => {
      const result = await updateGenreParent(genreUuid, parentUuid);
      if (!result.success) {
        showPopup(new ApiErrorPopupContentObject(result.error));
      }
    };

    const renameGenre = async (genreUuid, newName) => {
      const result = await renameGenre(genreUuid, newName);
      if (!result.success) {
        showPopup(new ApiErrorPopupContentObject(result.error));
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
      handleGenreAddAction,
      setGenreGettingAssignedNewParent,
      updateGenreParent,
      renameGenre,
      showPopup,
      GenreDeletionPopupContentObject,
      setPreviousRenderingVisibleActionsContainerGenrePlaylistUuid,
    });

    // Cleanup on unmount
    return () => {
      if (svg) {
        svg.selectAll("*").remove();
      }
    };
  }, [
    genrePlaylistsTree,
    playState,
    trackListOrigin,
    genreUuidGettingAssignedNewParent,
    forbiddenNewParentsUuids,
    previousRenderingVisibleActionsContainerGenrePlaylist,
    svgWidth,
    svgHeight,
    handleGenreAddAction,
    handlePlayPauseIconAction,
    setGenreGettingAssignedNewParent,
    updateGenreParent,
    renameGenre,
    showPopup,
  ]);

  return (
    <div>
      <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
      <svg ref={svgRef} width={svgWidth} height={svgHeight} className="mt-5"></svg>
    </div>
  );
}

GenrePlaylistsTree.propTypes = {
  genrePlaylistsTree: PropTypes.array.isRequired,
};
