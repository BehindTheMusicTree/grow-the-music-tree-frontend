import { addGrid } from "../d3Helper";
import { appendPaths } from "./TreeHelper";
import { addMoreIconContainer, addActionsGroup, addParentSelectionOverlay } from "./TreeNodeHelper";
import {
  RECT_BASE_DIMENSIONS,
  HORIZONTAL_SEPARATOON_BETWEEN_NODES,
  VERTICAL_SEPARATOON_BETWEEN_NODES,
  MORE_ICON_WIDTH,
  ACTIONS_CONTAINER_DIMENSIONS_MAX,
  RECTANGLE_COLOR,
} from "./tree-constants";

/**
 * Calculates SVG dimensions based on tree data
 */
export function calculateSvgDimensions(d3, treeData) {
  const highestNodeVerticalCoordinate = d3.min(treeData.descendants(), (d) => d.x);
  const highestVerticalCoordinate =
    highestNodeVerticalCoordinate + RECT_BASE_DIMENSIONS.HEIGHT / 2 - ACTIONS_CONTAINER_DIMENSIONS_MAX.HEIGHT / 2;
  const lowestNodeVerticalCoordinate = d3.max(treeData.descendants(), (d) => d.x);
  const lowestVerticalCoordinate =
    lowestNodeVerticalCoordinate + RECT_BASE_DIMENSIONS.HEIGHT / 2 + ACTIONS_CONTAINER_DIMENSIONS_MAX.HEIGHT / 2;
  const svgHeight = lowestVerticalCoordinate - highestVerticalCoordinate;

  const maximumLevel = d3.max(treeData.descendants(), (d) => d.depth);
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

/**
 * Setup tree layout and transforms coordinates for SVG rendering
 */
export function setupTreeLayout(d3, treeData, highestVerticalCoordinate) {
  // The tree layout has x as vertical and y as horizontal whereas svg logic is the opposite.
  // Therefore, we need to swap x and y.
  treeData.each(function (d) {
    const tempX = d.x;
    d.x = d.y;
    d.y = tempX - highestVerticalCoordinate;
  });
  // Now in the tree layout, x is horizontal and y is vertical as in the svg logic.
  return treeData;
}

/**
 * Renders the complete D3 tree
 */
export function renderTree(d3, svgRef, treeData, svgWidth, svgHeight, callbacks) {
  const {
    previousRenderingVisibleActionsContainerGenrePlaylist,
    genrePlaylistGettingAssignedNewParent,
    forbiddenNewParentsUuids,
    trackListOrigin,
    playState,
    handlePlayPauseIconAction,
    fileInputRef,
    selectingFileGenreUuidRef,
    handleGenreCreationAction,
    setGenrePlaylistGettingAssignedNewParent,
    updateGenreParent,
    renameGenre,
    showPopup,
    setPreviousRenderingVisibleActionsContainerGenrePlaylistUuid,
  } = callbacks;

  const svg = d3.select(svgRef.current).append("svg").attr("width", svgWidth).attr("height", svgHeight).append("g");

  addGrid(svg, svgWidth, svgHeight, true);

  appendPaths(d3, svg, treeData, RECT_BASE_DIMENSIONS.WIDTH / 2, RECT_BASE_DIMENSIONS.HEIGHT / 2);

  const nodes = svg
    .selectAll("g.node")
    .data(treeData.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("id", (d) => "group-" + d.data.uuid)
    .attr("transform", function (d) {
      const translateX = d.x + RECT_BASE_DIMENSIONS.WIDTH / 2;
      const translateY = d.y + RECT_BASE_DIMENSIONS.HEIGHT / 2;
      return `translate(${translateX}, ${translateY})`;
    });

  const aGenreIsGettingAssignedNewParent = forbiddenNewParentsUuids !== null;
  const genreIsAPotentialChoiceForTheGenreGettingAssignedANewParent = (d) =>
    d.data.criteria && aGenreIsGettingAssignedNewParent && !forbiddenNewParentsUuids.includes(d.data.criteria.uuid);

  nodes
    .append("rect")
    .attr("class", "node-base-rect")
    .attr("width", RECT_BASE_DIMENSIONS.WIDTH)
    .attr("height", RECT_BASE_DIMENSIONS.HEIGHT)
    .attr("x", -RECT_BASE_DIMENSIONS.WIDTH / 2)
    .attr("y", -RECT_BASE_DIMENSIONS.HEIGHT / 2)
    .attr("fill", RECTANGLE_COLOR)
    .style("stroke", function (d) {
      return genreIsAPotentialChoiceForTheGenreGettingAssignedANewParent(d) ? "blue" : "none";
    })
    .style("stroke-width", function (d) {
      return genreIsAPotentialChoiceForTheGenreGettingAssignedANewParent(d) ? "2px" : "0px";
    });

  const handleMoreActionEnterMouse = (event, d, genrePlaylist) => {
    event.stopPropagation();
    const genrePlaylistUuid = genrePlaylist.uuid;
    const group = d3.select("#group-" + genrePlaylistUuid);
    const actionsContainer = group.select("#actions-container-" + genrePlaylistUuid);
    if (actionsContainer.empty()) {
      addMoreIconContainer(d3, genrePlaylist, group, { handleMoreActionEnterMouse });
      addActionsGroup(d3, genrePlaylist, group, {
        handlePlayPauseIconAction,
        fileInputRef,
        selectingFileGenreUuidRef,
        handleGenreCreationAction,
        setGenrePlaylistGettingAssignedNewParent,
        renameGenre,
        showPopup,
        trackListOrigin,
        playState,
      });
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
      d3.select(this.parentNode)
        .select("#more-icon-container-" + d.data.uuid)
        .remove();
      d3.select(this.parentNode)
        .select("#actions-container-" + d.data.uuid)
        .remove();
    })
    .on("mouseover", function (event, d) {
      if (!aGenreIsGettingAssignedNewParent) {
        setPreviousRenderingVisibleActionsContainerGenrePlaylistUuid(d.data);
        addMoreIconContainer(d3, d.data, d3.select(this.parentNode), { handleMoreActionEnterMouse });
      } else {
        if (genreIsAPotentialChoiceForTheGenreGettingAssignedANewParent(d)) {
          const parentNode = d3.select(this.parentNode);
          addParentSelectionOverlay(d3, parentNode, {
            updateGenreParent,
            genrePlaylistGettingAssignedNewParent,
            setGenrePlaylistGettingAssignedNewParent,
          });
        }
      }
    });

  if (previousRenderingVisibleActionsContainerGenrePlaylist) {
    const group = d3.select("#group-" + previousRenderingVisibleActionsContainerGenrePlaylist.uuid);
    addMoreIconContainer(d3, previousRenderingVisibleActionsContainerGenrePlaylist, group, {
      handleMoreActionEnterMouse,
    });
    addActionsGroup(d3, previousRenderingVisibleActionsContainerGenrePlaylist, group, {
      handlePlayPauseIconAction,
      fileInputRef,
      selectingFileGenreUuidRef,
      handleGenreCreationAction,
      setGenrePlaylistGettingAssignedNewParent,
      renameGenre,
      showPopup,
      trackListOrigin,
      playState,
    });
  }

  nodes.each(function () {
    const group = d3.select(this);
    group.on("mouseleave", function (event, d) {
      setPreviousRenderingVisibleActionsContainerGenrePlaylistUuid(null);
      d3.select("#more-icon-container-" + d.id).remove();
      d3.select("#actions-container-" + d.id).remove();
    });
  });

  return svg;
}

/**
 * Creates a D3 tree layout from the tree data
 */
export function createTreeLayout(d3, root) {
  const treeLayout = d3.tree().nodeSize([VERTICAL_SEPARATOON_BETWEEN_NODES, HORIZONTAL_SEPARATOON_BETWEEN_NODES]);
  return treeLayout(root);
}
