"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as d3 from "d3";

import { usePopup } from "@contexts/PopupContext";
import { useTrackList } from "@contexts/TrackListContext";
import { useUpdateGenre, useCreateGenre, useFetchGenre } from "@hooks/useGenre";
import { useFetchGenrePlaylistDetailed } from "@hooks/useGenrePlaylist";
import { usePlayer } from "@contexts/PlayerContext";

import { PlayStates } from "@models/PlayStates";
import { TrackListOriginType } from "@models/track-list/origin/TrackListOriginType";

import TrackUploadPopup from "@components/ui/popup/child/TrackUploadPopup";
import InvalidInputPopup from "@components/ui/popup/child/InvalidInputPopup";
import GenreRenamePopup from "@components/ui/popup/child/GenreRenamePopup";
import { CriteriaPlaylistSimple } from "@domain/playlist/criteria-playlist/simple";
import { CriteriaMinimum } from "@domain/criteria/response/minimum";
import { CriteriaDetailed } from "@schemas/domain/criteria/response/detailed";

import { buildTreeHierarchyStructure } from "./NodeHelper";
import { calculateSvgDimensions, createTreeLayout, setupTreeLayout, renderTree } from "./tree-renderer";
import { getRootTreeColor } from "./constants";

type GenrePlaylistTreePerRootProps = {
  className?: string;
  rootUuid: string;
  genrePlaylistTreePerRoot: CriteriaPlaylistSimple[];
  genreGettingAssignedNewParent: CriteriaDetailed | null;
  setGenreGettingAssignedNewParent: (genre: CriteriaDetailed | null) => void;
  handleGenreCreationAction: (parent: CriteriaMinimum | null) => void;
};

export default function GenrePlaylistTreePerRoot({
  className,
  rootUuid,
  genrePlaylistTreePerRoot,
  genreGettingAssignedNewParent,
  setGenreGettingAssignedNewParent,
  handleGenreCreationAction,
}: GenrePlaylistTreePerRootProps) {
  const [forbiddenNewParentsUuids, setForbiddenNewParentsUuids] = useState<string[]>([]);
  const { isPlaying, setIsPlaying } = usePlayer();
  const { showPopup, hidePopup } = usePopup();
  const { trackList, playNewTrackListFromGenrePlaylist } = useTrackList();
  const { mutate: createGenre } = useCreateGenre("me");
  const { renameGenre, updateGenreParent } = useUpdateGenre("me");
  const fetchGenre = useFetchGenre("me");
  const { mutate: fetchGenrePlaylistDetailed } = useFetchGenrePlaylistDetailed();
  const [visibleActionsContainerGenrePlaylist, setVisibleActionsContainerGenrePlaylist] =
    useState<CriteriaPlaylistSimple | null>(null);
  const [svgWidth, setSvgWidth] = useState(0);
  const [svgHeight, setSvgHeight] = useState(0);

  const svgRef = useRef<SVGSVGElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectingFileGenreUuidRef = useRef<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      showPopup(
        <TrackUploadPopup
          files={fileArray}
          genre={selectingFileGenreUuidRef.current}
          onComplete={() => {}}
          onClose={() => {
            hidePopup();
          }}
        />,
      );
    }
    event.target.value = "";
  };

  const handlePlayPauseIconAction = useCallback(
    async (genrePlaylist: CriteriaPlaylistSimple) => {
      // If already playing this playlist, toggle play/pause
      if (
        trackList &&
        trackList.origin.type === TrackListOriginType.PLAYLIST &&
        trackList.origin.uuid === genrePlaylist.uuid
      ) {
        setIsPlaying(!isPlaying);
        return;
      }

      // If playlist has no tracks, do nothing
      if (genrePlaylist.uploadedTracksCount === 0) {
        return;
      }

      // Fetch detailed genre playlist and play it
      fetchGenrePlaylistDetailed(genrePlaylist.uuid, {
        onSuccess: (detailedPlaylist) => {
          playNewTrackListFromGenrePlaylist(detailedPlaylist);
        },
        onError: (error) => {
          console.error("Failed to fetch detailed genre playlist:", error);
        },
      });
    },
    [trackList, isPlaying, setIsPlaying, playNewTrackListFromGenrePlaylist, fetchGenrePlaylistDetailed],
  );

  const { treeData, rootColor } = useMemo(() => {
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

    // Get root-specific color
    const rootColor = getRootTreeColor(rootUuid);

    return { treeData: reshapedTreeData, rootColor };
  }, [genrePlaylistTreePerRoot, rootUuid]);

  // Calculate forbidden UUIDs for the genre getting assigned a new parent
  const genreGettingAssignedNewParentForbiddenUuids = useMemo(() => {
    if (!genreGettingAssignedNewParent) return [];

    const descendantUuids = genreGettingAssignedNewParent.descendants.map((d) => d.descendant.uuid);
    return [genreGettingAssignedNewParent.uuid, ...descendantUuids];
  }, [genreGettingAssignedNewParent]);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear any previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

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
            />,
          );
        }
      }
    };

    const showRenamePopup = (genre: CriteriaMinimum) => {
      showPopup(
        <GenreRenamePopup
          genre={genre}
          onSubmit={({ name }) => {
            handleRenameGenre(genre.uuid, name);
            hidePopup();
          }}
          onClose={hidePopup}
        />,
      );
    };

    renderTree(
      d3,
      svgRef,
      treeData,
      svgWidth,
      svgHeight,
      visibleActionsContainerGenrePlaylist,
      genreGettingAssignedNewParent,
      genreGettingAssignedNewParentForbiddenUuids,
      forbiddenNewParentsUuids,
      trackList ? trackList.origin : null,
      isPlaying ? PlayStates.PLAYING : PlayStates.STOPPED,
      fileInputRef,
      selectingFileGenreUuidRef,
      rootColor,
      {
        setForbiddenNewParentsUuids,
        handlePlayPauseIconAction,
        handleGenreCreationAction,
        setGenreGettingAssignedNewParent,
        fetchGenre,
        updateGenreParent,
        handleRenameGenre,
        showRenamePopup,
        showPopup,
        setVisibleActionsContainerGenrePlaylist,
      },
    );
  }, [
    genrePlaylistTreePerRoot,
    isPlaying,
    trackList?.origin,
    genreGettingAssignedNewParent,
    genreGettingAssignedNewParentForbiddenUuids,
    forbiddenNewParentsUuids,
    trackList,
    visibleActionsContainerGenrePlaylist,
    svgWidth,
    svgHeight,
    treeData,
    rootColor,
    createGenre,
    handlePlayPauseIconAction,
    setGenreGettingAssignedNewParent,
    updateGenreParent,
    showPopup,
    handleGenreCreationAction,
    renameGenre,
    fetchGenre,
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
