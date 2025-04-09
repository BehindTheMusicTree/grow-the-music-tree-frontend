import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";

import { usePopup } from "../../../../../contexts/PopupContext";
import { useTrackList } from "../../../../../contexts/track-list/useTrackList";
import { useGenrePlaylists } from "../../../../../contexts/genre-playlists/useGenrePlaylists";
import { usePlayer } from "../../../../../contexts/usePlayer";
import { useGenreGettingAssignedNewParent } from "../../../../../contexts/genre-getting-assigned-new-parent/useGenreGettingAssignedNewParent";

import { PLAY_STATES, TRACK_LIST_ORIGIN_TYPE } from "../../../../../utils/constants";
import TrackUploadPopupContentObject from "../../../../../models/popup-content-object/TrackUploadPopupContentObject";
import GenreDeletionPopupContentObject from "../../../../../models/popup-content-object/GenreDeletionPopupContentObject";

import { buildTreeHierarchy } from "./TreeNodeHelper.jsx";
import { calculateSvgDimensions, createTreeLayout, setupTreeLayout, renderTree } from "./D3TreeRenderer";

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
