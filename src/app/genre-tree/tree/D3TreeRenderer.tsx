"use client";

import * as d3 from "d3";

import { CriteriaPlaylistSimple } from "@domain/playlist/criteria-playlist/simple";
import { CriteriaMinimum } from "@domain/criteria/response/minimum";
import { PlayStates } from "@models/PlayStates";
import TrackListOrigin from "@models/track-list/origin/TrackListOrigin";

import {
  RECT_BASE_DIMENSIONS,
  HORIZONTAL_SEPARATOON_BETWEEN_NODES,
  VERTICAL_SEPARATOON_BETWEEN_NODES,
  MORE_ICON_WIDTH,
  ACTIONS_CONTAINER_DIMENSIONS_MAX,
  RECTANGLE_COLOR,
} from "./tree-constants";
import { addGrid } from "../d3Helper";
import { appendPaths } from "./TreeHelper";
import { addMoreIconContainer, addActionsGroup, addParentSelectionOverlay } from "./TreeNodeHelper";

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
  setGenrePlaylistGettingAssignedNewParent: (genrePlaylist: CriteriaPlaylistSimple | null) => void;
  setForbiddenNewParentsUuids: React.Dispatch<React.SetStateAction<string[]>>;
  updateGenreParent: (genreUuid: string, newParentUuid: string) => Promise<void>;
  handleRenameGenre: (
    criteriaUuid: string,
    newName: string,
    showPopup: (title: string, message: string) => void
  ) => Promise<void>;
  showPopup: (title: string, message: string) => void;
  setPreviousRenderingVisibleActionsContainerGenrePlaylist: (genrePlaylist: CriteriaPlaylistSimple | null) => void;
}

export function calculateSvgDimensions(d3: typeof import("d3"), treeData: D3Node): SvgDimensions {
  const highestNodeVerticalCoordinate = d3.min(treeData.descendants(), (d) => d.x)!;
  const highestVerticalCoordinate =
    highestNodeVerticalCoordinate + RECT_BASE_DIMENSIONS.HEIGHT / 2 - ACTIONS_CONTAINER_DIMENSIONS_MAX.HEIGHT / 2;
  const lowestNodeVerticalCoordinate = d3.max(treeData.descendants(), (d) => d.x)!;
  const lowestVerticalCoordinate =
    lowestNodeVerticalCoordinate + RECT_BASE_DIMENSIONS.HEIGHT / 2 + ACTIONS_CONTAINER_DIMENSIONS_MAX.HEIGHT / 2;
  const svgHeight = lowestVerticalCoordinate - highestVerticalCoordinate;

  const maximumLevel = d3.max(treeData.descendants(), (d) => d.depth)!;
  const svgWidth =
    maximumLevel * HORIZONTAL_SEPARATOON_BETWEEN_NODES +
    RECT_BASE_DIMENSIONS.WIDTH +
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
  previousRenderingVisibleActionsContainerGenrePlaylist: CriteriaPlaylistSimple | null,
  genrePlaylistGettingAssignedNewParent: CriteriaPlaylistSimple | null,
  forbiddenNewParentsUuids: string[] | null,
  trackListOrigin: TrackListOrigin | null,
  playState: PlayStates,
  fileInputRef: React.RefObject<HTMLInputElement>,
  selectingFileGenreUuidRef: React.MutableRefObject<string | null>,
  callbacks: TreeCallbacks
): D3Selection {
  const {
    handlePlayPauseIconAction,
    handleGenreCreationAction,
    setGenrePlaylistGettingAssignedNewParent,
    setForbiddenNewParentsUuids,
    updateGenreParent,
    handleRenameGenre: renameGenre,
    showPopup,
    setPreviousRenderingVisibleActionsContainerGenrePlaylist,
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

  appendPaths(d3, svg, treeData, RECT_BASE_DIMENSIONS.WIDTH / 2, RECT_BASE_DIMENSIONS.HEIGHT / 2);

  // Hack to invert the tree so that x is horizontal and y is vertical
  const nodes = svg
    .selectAll<SVGGElement, D3Node>("g.node")
    .data(treeData.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("id", (d) => "group-" + d.data.uuid)
    .attr("transform", function (d) {
      const translateX = d.x! + RECT_BASE_DIMENSIONS.WIDTH / 2;
      const translateY = d.y! + RECT_BASE_DIMENSIONS.HEIGHT / 2;
      return `translate(${translateX}, ${translateY})`;
    });

  nodes
    .append("rect")
    .attr("class", "node-base-rect")
    .attr("width", RECT_BASE_DIMENSIONS.WIDTH)
    .attr("height", RECT_BASE_DIMENSIONS.HEIGHT)
    .attr("x", -RECT_BASE_DIMENSIONS.WIDTH / 2)
    .attr("y", -RECT_BASE_DIMENSIONS.HEIGHT / 2)
    .attr("fill", RECTANGLE_COLOR)
    .style("stroke", function (d) {
      return d.data.criteria ? "blue" : "none";
    })
    .style("stroke-width", function (d) {
      return d.data.criteria ? "2px" : "0px";
    });

  const handleMoreActionEnterMouse = (event: MouseEvent, d: D3Node, genrePlaylist: CriteriaPlaylistSimple) => {
    event.stopPropagation();

    const genrePlaylistUuid = genrePlaylist.uuid;
    const group = d3.select<SVGGElement, unknown>("#group-" + genrePlaylistUuid);
    const actionsContainer = group.select<SVGGElement>("#actions-container-" + genrePlaylistUuid);

    if (actionsContainer.empty()) {
      addMoreIconContainer(d3, genrePlaylist, group, handleMoreActionEnterMouse);
      addActionsGroup(d3, genrePlaylist, group, {
        handlePlayPauseIconAction,
        fileInputRef,
        selectingFileGenreUuidRef: selectingFileGenreUuidRef,
        handleGenreCreationAction,
        setGenrePlaylistGettingAssignedNewParent,
        renameGenre,
        showPopup,
        trackListOrigin: trackListOrigin!,
        playState,
        handleMoreActionEnterMouse,
      });
      setPreviousRenderingVisibleActionsContainerGenrePlaylist(d.data);
    }
  };

  nodes
    .append("foreignObject")
    .attr("class", "tree-info-container")
    .attr("width", RECT_BASE_DIMENSIONS.WIDTH)
    .attr("height", RECT_BASE_DIMENSIONS.HEIGHT)
    .attr("x", -RECT_BASE_DIMENSIONS.WIDTH / 2)
    .attr("y", -RECT_BASE_DIMENSIONS.HEIGHT / 2)
    .html(function (d) {
      return `<div class="tree-info">${d.data.name}</div>`;
    })
    .on("mouseleave", function (event, d) {
      const parentNode = this.parentNode as SVGGElement;
      if (parentNode) {
        // d3.select<SVGGElement, unknown>(parentNode)
        //   .select<SVGGElement>("#more-icon-container-" + d.data.uuid)
        //   .remove();
        // d3.select<SVGGElement, unknown>(parentNode)
        //   .select<SVGGElement>("#actions-container-" + d.data.uuid)
        //   .remove();
      }
    })
    .on("mouseover", function (event, d) {
      if (!d.data.criteria) {
        addMoreIconContainer(
          d3,
          d.data,
          d3.select<SVGGElement, unknown>(this.parentNode as SVGGElement) as unknown as d3.Selection<
            SVGGElement,
            unknown,
            HTMLElement,
            unknown
          >,
          handleMoreActionEnterMouse
        );
      }
    });

  nodes.each(function (d: D3Node) {
    const group = d3.select<SVGGElement, unknown>(this);
    group.on("mouseleave", function (event) {
      setPreviousRenderingVisibleActionsContainerGenrePlaylist(null);
      // d3.select<SVGGElement, unknown>("#more-icon-container-" + d.data.uuid).remove();
      // d3.select<SVGGElement, unknown>("#actions-container-" + d.data.uuid).remove();
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
