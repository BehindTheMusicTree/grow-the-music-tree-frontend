"use client";

import * as d3 from "d3";

import { CriteriaPlaylistSimple } from "@domain/playlist/criteria-playlist/simple";
import { CriteriaMinimum } from "@domain/criteria/response/minimum";
import { PlayStates } from "@models/PlayStates";
import TrackListOrigin from "@models/track-list/origin/TrackListOrigin";

import {
  HORIZONTAL_SEPARATOON_BETWEEN_NODES,
  VERTICAL_SEPARATOON_BETWEEN_NODES,
  MORE_ICON_WIDTH,
  ACTIONS_CONTAINER_DIMENSIONS_MAX,
  calculateNodeDimensions,
  getMaxNodeDimensions,
} from "./constants";
import { addGrid } from "../d3-helper/d3-grid-helper";
import { appendPaths } from "../d3-helper/d3-path-helper";
import { addMoreIconContainer, addActionsGroup, addParentSelectionOverlay } from "./NodeHelper";
import { CriteriaDetailed } from "@schemas/domain/criteria/response/detailed";

type D3Selection = d3.Selection<SVGGElement, unknown, null, undefined>;
type D3Node = d3.HierarchyNode<CriteriaPlaylistSimple>;

interface SvgDimensions {
  svgWidth: number;
  svgHeight: number;
  highestVerticalCoordinate: number;
}

interface TreeCallbacks {
  handlePlayPauseIconAction: (genrePlaylist: CriteriaPlaylistSimple) => void;
  handleGenreCreationAction: (parent: CriteriaMinimum | null) => void;
  setGenreGettingAssignedNewParent: (genre: CriteriaDetailed | null) => void;
  fetchGenre: (criteriaUuid: string) => Promise<CriteriaDetailed>;
  setForbiddenNewParentsUuids: React.Dispatch<React.SetStateAction<string[]>>;
  updateGenreParent: (genreUuid: string, newParentUuid: string) => Promise<void>;
  handleRenameGenre: (
    criteriaUuid: string,
    newName: string,
    showPopup: (title: string, message: string) => void
  ) => Promise<void>;
  showPopup: (title: string, message: string) => void;
  setVisibleActionsContainerGenrePlaylist: (genrePlaylist: CriteriaPlaylistSimple | null) => void;
}

export function calculateSvgDimensions(d3: typeof import("d3"), treeData: D3Node): SvgDimensions {
  const nodes = treeData.descendants();
  const maxNodeDimensions = getMaxNodeDimensions(nodes.map((d) => d.data));

  const highestNodeVerticalCoordinate = d3.min(nodes, (d) => d.x)!;
  const highestVerticalCoordinate =
    highestNodeVerticalCoordinate + maxNodeDimensions.HEIGHT / 2 - ACTIONS_CONTAINER_DIMENSIONS_MAX.HEIGHT / 2;
  const lowestNodeVerticalCoordinate = d3.max(nodes, (d) => d.x)!;
  const lowestVerticalCoordinate =
    lowestNodeVerticalCoordinate + maxNodeDimensions.HEIGHT / 2 + ACTIONS_CONTAINER_DIMENSIONS_MAX.HEIGHT / 2;
  const svgHeight = lowestVerticalCoordinate - highestVerticalCoordinate;

  const maximumLevel = d3.max(nodes, (d) => d.depth)!;
  const svgWidth =
    maximumLevel * HORIZONTAL_SEPARATOON_BETWEEN_NODES +
    maxNodeDimensions.WIDTH +
    MORE_ICON_WIDTH +
    ACTIONS_CONTAINER_DIMENSIONS_MAX.WIDTH;

  return {
    svgWidth,
    svgHeight,
    highestVerticalCoordinate,
  };
}

export function setupTreeLayout(d3: typeof import("d3"), treeData: D3Node, highestVerticalCoordinate: number): D3Node {
  treeData.each(function (d) {
    const tempX = d.x!;
    d.x = d.y!;
    d.y = tempX - highestVerticalCoordinate;
  });
  return treeData;
}

export function renderTree(
  d3: typeof import("d3"),
  svgRef: React.RefObject<SVGSVGElement>,
  treeData: D3Node,
  svgWidth: number,
  svgHeight: number,
  visibleActionsContainerGenrePlaylist: CriteriaPlaylistSimple | null,
  genreGettingAssignedNewParent: CriteriaDetailed | null,
  genreGettingAssignedNewParentForbiddenUuids: string[] | null,
  forbiddenNewParentsUuids: string[] | null,
  trackListOrigin: TrackListOrigin | null,
  playState: PlayStates,
  fileInputRef: React.RefObject<HTMLInputElement>,
  selectingFileGenreUuidRef: React.MutableRefObject<string | null>,
  rootColor: string,
  callbacks: TreeCallbacks
): D3Selection {
  const {
    handlePlayPauseIconAction,
    handleGenreCreationAction,
    setGenreGettingAssignedNewParent,
    fetchGenre,
    updateGenreParent,
    handleRenameGenre: renameGenre,
    showPopup,
  } = callbacks;

  if (!svgRef.current) {
    throw new Error("SVG reference is null");
  }

  const svg = d3
    .select<SVGSVGElement, unknown>(svgRef.current)
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g") as unknown as D3Selection;

  addGrid(svg, svgWidth, svgHeight, true);

  appendPaths(d3, svg, treeData, 0, 0);

  // Hack to invert the tree so that x is horizontal and y is vertical
  const nodes = svg
    .selectAll<SVGGElement, D3Node>("g.node")
    .data(treeData.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("id", (d) => "group-" + d.data.uuid)
    .attr("transform", function (d) {
      const dimensions = calculateNodeDimensions(d.data.uploadedTracksCount);
      const translateX = d.x! + dimensions.WIDTH / 2;
      const translateY = d.y! + dimensions.HEIGHT / 2;
      return `translate(${translateX}, ${translateY})`;
    });

  nodes
    .append("rect")
    .attr("class", "node-base-rect")
    .attr("width", (d) => {
      const dimensions = calculateNodeDimensions(d.data.uploadedTracksCount);
      return dimensions.WIDTH;
    })
    .attr("height", (d) => {
      const dimensions = calculateNodeDimensions(d.data.uploadedTracksCount);
      return dimensions.HEIGHT;
    })
    .attr("x", (d) => {
      const dimensions = calculateNodeDimensions(d.data.uploadedTracksCount);
      return -dimensions.WIDTH / 2;
    })
    .attr("y", (d) => {
      const dimensions = calculateNodeDimensions(d.data.uploadedTracksCount);
      return -dimensions.HEIGHT / 2;
    })
    .attr("fill", function (d) {
      // Grey out forbidden nodes (the genre itself and its descendants)
      const isForbidden =
        d.data.criteria &&
        ((forbiddenNewParentsUuids && forbiddenNewParentsUuids.includes(d.data.criteria.uuid)) ||
          (genreGettingAssignedNewParentForbiddenUuids &&
            genreGettingAssignedNewParentForbiddenUuids.includes(d.data.criteria.uuid)));

      if (isForbidden) {
        return "#cccccc";
      }
      return rootColor;
    });

  const handleMoreActionEnterMouse = (event: MouseEvent, d: D3Node, genrePlaylist: CriteriaPlaylistSimple) => {
    event.stopPropagation();

    const group = d3.select<SVGGElement, unknown>("#group-" + genrePlaylist.uuid);
    const actionsContainer = group.select<SVGGElement>("#actions-container-" + genrePlaylist.uuid);

    if (actionsContainer.empty()) {
      addMoreIconContainer(d3, genrePlaylist, group, handleMoreActionEnterMouse, rootColor);
      addActionsGroup(
        d3,
        genrePlaylist,
        group,
        {
          handlePlayPauseIconAction,
          fileInputRef,
          selectingFileGenreUuidRef: selectingFileGenreUuidRef,
          handleGenreCreationAction,
          setGenreGettingAssignedNewParent,
          fetchGenre,
          renameGenre,
          showPopup,
          trackListOrigin: trackListOrigin!,
          playState,
          handleMoreActionEnterMouse,
        },
        rootColor
      );
      // setVisibleActionsContainerGenrePlaylist(d.data); // REMOVE THIS
    }
  };

  nodes
    .append("foreignObject")
    .attr("class", "tree-info-container")
    .attr("width", (d) => {
      const dimensions = calculateNodeDimensions(d.data.uploadedTracksCount);
      return dimensions.WIDTH;
    })
    .attr("height", (d) => {
      const dimensions = calculateNodeDimensions(d.data.uploadedTracksCount);
      return dimensions.HEIGHT;
    })
    .attr("x", (d) => {
      const dimensions = calculateNodeDimensions(d.data.uploadedTracksCount);
      return -dimensions.WIDTH / 2;
    })
    .attr("y", (d) => {
      const dimensions = calculateNodeDimensions(d.data.uploadedTracksCount);
      return -dimensions.HEIGHT / 2;
    })
    .html(function (d) {
      const isForbidden =
        d.data.criteria &&
        ((forbiddenNewParentsUuids && forbiddenNewParentsUuids.includes(d.data.criteria.uuid)) ||
          (genreGettingAssignedNewParentForbiddenUuids &&
            genreGettingAssignedNewParentForbiddenUuids.includes(d.data.criteria.uuid)));
      const textColor = isForbidden ? "color: #888888;" : "";
      const trackCountText = d.data.uploadedTracksCount > 0 ? ` (${d.data.uploadedTracksCount})` : "";
      return `<div class="tree-info" style="${textColor} display: flex; align-items: center; justify-content: center; height: 100%; font-size: 12px; font-weight: 500;">${d.data.name}${trackCountText}</div>`;
    })
    .on("mouseover", function (event, d) {
      // Don't show more container when assigning new parent or for forbidden nodes
      const isForbidden =
        d.data.criteria &&
        ((forbiddenNewParentsUuids && forbiddenNewParentsUuids.includes(d.data.criteria.uuid)) ||
          (genreGettingAssignedNewParentForbiddenUuids &&
            genreGettingAssignedNewParentForbiddenUuids.includes(d.data.criteria.uuid)));

      if (!genreGettingAssignedNewParent && !isForbidden) {
        addMoreIconContainer(
          d3,
          d.data,
          d3.select<SVGGElement, unknown>(this.parentNode as SVGGElement) as unknown as d3.Selection<
            SVGGElement,
            unknown,
            HTMLElement,
            unknown
          >,
          handleMoreActionEnterMouse,
          rootColor
        );
      }
    });

  nodes.each(function (d: D3Node) {
    const group = d3.select<SVGGElement, unknown>(this);
    if (visibleActionsContainerGenrePlaylist && d.data.uuid === visibleActionsContainerGenrePlaylist.uuid) {
      const fakeEvent = { stopPropagation: () => {} } as unknown as MouseEvent;
      handleMoreActionEnterMouse(fakeEvent, d, d.data);
    }

    group.on("mouseenter", function () {
      // Add parent selection overlay when a genre is being assigned a new parent
      // Don't show overlay for forbidden nodes (includes the genre itself and its descendants)
      const isForbidden =
        d.data.criteria &&
        ((forbiddenNewParentsUuids && forbiddenNewParentsUuids.includes(d.data.criteria.uuid)) ||
          (genreGettingAssignedNewParentForbiddenUuids &&
            genreGettingAssignedNewParentForbiddenUuids.includes(d.data.criteria.uuid)));

      if (genreGettingAssignedNewParent && d.data.criteria && !isForbidden) {
        addParentSelectionOverlay(d3, group as unknown as d3.Selection<SVGGElement, unknown, HTMLElement, unknown>, {
          updateGenreParent,
          setGenreGettingAssignedNewParent,
          genreGettingAssignedNewParent,
        });
      }
    });

    group.on("mouseleave", function () {
      // When leaving node: add a small delay to check if we're truly leaving everything
      setTimeout(() => {
        const moreContainer = d3.select<SVGGElement, unknown>("#more-icon-container-" + d.data.uuid);
        const actionsContainer = d3.select<SVGGElement, unknown>("#actions-container-" + d.data.uuid);

        if (moreContainer.empty() && actionsContainer.empty()) {
          // No containers exist, so we're leaving everything - hide all
          d3.select<SVGGElement, unknown>("#select-as-new-parent-group-" + d.data.uuid).remove();
        } else {
          // If containers exist but we're leaving the node, remove them
          moreContainer.remove();
          actionsContainer.remove();
          d3.select<SVGGElement, unknown>("#select-as-new-parent-group-" + d.data.uuid).remove();
        }
      }, 100);
    });
  });

  return svg;
}

export function createTreeLayout(d3: typeof import("d3"), root: D3Node): D3Node {
  const treeLayout = d3
    .tree<CriteriaPlaylistSimple>()
    .nodeSize([VERTICAL_SEPARATOON_BETWEEN_NODES, HORIZONTAL_SEPARATOON_BETWEEN_NODES]);
  return treeLayout(root);
}
