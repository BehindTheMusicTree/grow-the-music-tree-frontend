import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import ReactDOMServer from "react-dom/server";

import * as d3 from "d3";
import { FaSpinner, FaFileUpload, FaPlus, FaPlay, FaPause } from "react-icons/fa";
import { MdMoreVert } from "react-icons/md";
import { PiGraphFill } from "react-icons/pi";

import { usePopup } from "../../../../../contexts/popup/usePopup";
import { useTrackList } from "../../../../../contexts/track-list/useTrackList";
import { useGenrePlaylists } from "../../../../../contexts/genre-playlists/useGenrePlaylists";
import { usePlayer } from "../../../../../contexts/player/usePlayer";
import { useGenreGettingAssignedNewParent } from "../../../../../contexts/genre-getting-assigned-new-parent/useGenreGettingAssignedNewParent";
import { PLAY_STATES, TRACK_LIST_ORIGIN_TYPE } from "../../../../../utils/constants";
import {
  RECT_BASE_DIMENSIONS,
  VERTICAL_SEPARATOON_BETWEEN_NODES,
  HORIZONTAL_SEPARATOON_BETWEEN_NODES,
  MORE_ICON_WIDTH,
  ACTIONS_CONTAINER_X_OFFSET,
  ACTIONS_CONTAINER_DIMENSIONS,
  ACTION_CONTAINER_DIMENSIONS,
  ACTION_ICON_SIZE,
  ACTION_ICON_CONTAINER_DIMENSIONS,
  ACTION_LABEL_CONTAINER_DIMENSIONS,
} from "../../../../../utils/tree-dimensions";
import { PRIMARY_COLOR } from "../../../../../utils/theme";
import LibTrackUploadPopupContentObject from "../../../../../models/popup-content-object/LibTrackUploadPopupContentObject";

export default function GenrePlaylistsTree({ genrePlaylistsTree }) {
  const RECTANGLE_COLOR = PRIMARY_COLOR;

  const { playState, handlePlayPauseAction } = usePlayer();
  const { showPopup } = usePopup();
  const { handleGenreAddAction: handleAddGenreAction, updateGenreParent } = useGenrePlaylists();
  const { playNewTrackListFromPlaylistUuid, origin: trackListOrigin } = useTrackList();
  const [
    previousRenderingVisibleActionsContainerGenrePlaylistUuid,
    setPreviousRenderingVisibleActionsContainerGenrePlaylistUuid,
  ] = useState(null);
  const { genreUuidGettingAssignedNewParent, setGenreUuidGettingAssignedNewParent } =
    useGenreGettingAssignedNewParent();

  const svgRef = useRef(null);
  let svgWidth = useRef(0);
  let svgHeight = useRef(0);
  const fileInputRef = useRef(null);
  const selectingFileGenreUuidRef = useRef(null);

  async function handleFileChange(event) {
    const popupContentObject = new LibTrackUploadPopupContentObject(
      Array.from(event.target.files),
      selectingFileGenreUuidRef.current
    );
    showPopup(popupContentObject);
    event.target.value = null;
  }

  const buildTreeHierarchy = () => {
    return d3
      .stratify()
      .id((d) => d.uuid)
      .parentId((d) => d.parent?.uuid || null)(genrePlaylistsTree);
  };

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

  const addActionsContainer = (genrePlaylistUuid) => {
    const group = d3.select("#group-" + genrePlaylistUuid);
    let actionsContainerGroup = group.append("g").attr("id", "actions-container-" + genrePlaylistUuid);

    actionsContainerGroup
      .append("rect")
      .attr("id", "actions-background")
      .attr("x", ACTIONS_CONTAINER_X_OFFSET)
      .attr("y", -ACTIONS_CONTAINER_DIMENSIONS.HEIGHT / 2)
      .attr("width", ACTIONS_CONTAINER_DIMENSIONS.WIDTH)
      .attr("height", ACTIONS_CONTAINER_DIMENSIONS.HEIGHT)
      .attr("fill", RECTANGLE_COLOR);

    actionsContainerGroup
      .append("path")
      .attr("class", "smooth-mouseover-upper-triangle")
      .attr(
        "d",
        "M " +
          RECT_BASE_DIMENSIONS.WIDTH / 2 +
          " -" +
          RECT_BASE_DIMENSIONS.HEIGHT / 2 +
          " L " +
          ACTIONS_CONTAINER_X_OFFSET +
          " -" +
          ACTIONS_CONTAINER_DIMENSIONS.HEIGHT / 2 +
          " L " +
          ACTIONS_CONTAINER_X_OFFSET +
          " -" +
          RECT_BASE_DIMENSIONS.HEIGHT / 2 +
          " Z"
      )
      .attr("fill", "RGBA(0, 0, 0, 0)");

    actionsContainerGroup
      .append("path")
      .attr("class", "smooth-mouseover-lower-triangle")
      .attr(
        "d",
        "M " +
          RECT_BASE_DIMENSIONS.WIDTH / 2 +
          " " +
          RECT_BASE_DIMENSIONS.HEIGHT / 2 +
          " L " +
          ACTIONS_CONTAINER_X_OFFSET +
          " " +
          ACTIONS_CONTAINER_DIMENSIONS.HEIGHT / 2 +
          " L " +
          ACTIONS_CONTAINER_X_OFFSET +
          " " +
          RECT_BASE_DIMENSIONS.HEIGHT / 2 +
          " Z"
      )
      .attr("fill", "RGBA(0, 0, 0, 0)");

    const uploadTrackGroup = actionsContainerGroup
      .append("g")
      .attr("class", "upload-track-container cursor-pointer")
      .on("click", function (event, d) {
        event.stopPropagation();
        selectingFileGenreUuidRef.current = d.data.criteria.uuid;
        fileInputRef.current.click();
        group.dispatch("mouseleave");
      })
      .on("mouseover", function () {
        d3.select(this).selectAll("div").classed("bg-gray-500", true);
      })
      .on("mouseout", function () {
        d3.select(this).selectAll("div").classed("bg-gray-500", false);
      });

    uploadTrackGroup
      .append("foreignObject")
      .attr("x", ACTIONS_CONTAINER_X_OFFSET)
      .attr("y", -ACTIONS_CONTAINER_DIMENSIONS.HEIGHT / 2)
      .attr("width", ACTION_ICON_CONTAINER_DIMENSIONS.WIDTH)
      .attr("height", ACTION_ICON_CONTAINER_DIMENSIONS.HEIGHT)
      .html(function () {
        return ReactDOMServer.renderToString(
          <div className="upload-track-icon-container h-full w-full flex items-center justify-center">
            <FaFileUpload className="tree-icon" size={ACTION_ICON_SIZE} color="white" />
          </div>
        );
      });

    uploadTrackGroup
      .append("foreignObject")
      .attr("x", ACTIONS_CONTAINER_X_OFFSET + ACTION_ICON_CONTAINER_DIMENSIONS.WIDTH)
      .attr("y", -ACTIONS_CONTAINER_DIMENSIONS.HEIGHT / 2)
      .attr("width", ACTION_LABEL_CONTAINER_DIMENSIONS.WIDTH)
      .attr("height", ACTION_LABEL_CONTAINER_DIMENSIONS.HEIGHT)
      .html(function () {
        return ReactDOMServer.renderToString(<div className="tree-action-label-container">Upload track</div>);
      });

    const playPauseContainerGroup = actionsContainerGroup
      .append("g")
      .attr("class", function (d) {
        return "playpause-container" + (d.data.libraryTracksCount > 0 ? " cursor-pointer" : "");
      })
      .on("click", function (event, d) {
        event.stopPropagation();
        handlePlayPauseIconAction(d.data);
      })
      .on("mouseover", function (event, d) {
        if (d.data.libraryTracksCount > 0) {
          d3.select(this).selectAll("div").classed("bg-gray-500", true);
        }
      })
      .on("mouseout", function (event, d) {
        if (d.data.libraryTracksCount > 0) {
          d3.select(this).selectAll("div").classed("bg-gray-500", false);
        }
      });

    const SPINNER_ICON_SIZE = 14;
    const PLAY_PAUSE_SPINNER_Y = -ACTIONS_CONTAINER_DIMENSIONS.HEIGHT / 2 + ACTION_CONTAINER_DIMENSIONS.HEIGHT;
    playPauseContainerGroup
      .append("foreignObject")
      .attr("x", ACTIONS_CONTAINER_X_OFFSET)
      .attr("y", PLAY_PAUSE_SPINNER_Y)
      .attr("width", ACTION_CONTAINER_DIMENSIONS.WIDTH)
      .attr("height", ACTION_CONTAINER_DIMENSIONS.HEIGHT)
      .attr("dominant-baseline", "middle")
      .html(function (d) {
        if (
          trackListOrigin &&
          trackListOrigin.type === TRACK_LIST_ORIGIN_TYPE.PLAYLIST &&
          trackListOrigin.object.uuid === d.data.uuid &&
          playState === PLAY_STATES.LOADING
        ) {
          return ReactDOMServer.renderToString(
            <div className="spinner-container tree-action-icon-container">
              <FaSpinner size={SPINNER_ICON_SIZE} className="animate-spin fill-current text-white" />
            </div>
          );
        }
      });

    const PLAY_PAUSE_ICON_DIMENSIONS = {
      WIDTH: 12,
      HEIGHT: 12,
    };
    playPauseContainerGroup
      .append("foreignObject")
      .attr("x", ACTIONS_CONTAINER_X_OFFSET)
      .attr("y", PLAY_PAUSE_SPINNER_Y)
      .attr("width", ACTION_ICON_CONTAINER_DIMENSIONS.WIDTH)
      .attr("height", ACTION_ICON_CONTAINER_DIMENSIONS.HEIGHT)
      .style("visibility", function (d) {
        return trackListOrigin &&
          trackListOrigin.type === TRACK_LIST_ORIGIN_TYPE.PLAYLIST &&
          trackListOrigin.object.uuid === d.data.uuid &&
          playState === PLAY_STATES.LOADING
          ? "hidden"
          : "visible";
      })
      .html(function (d) {
        const playElement = (
          <div
            className={`playpause-container tree-action-icon-container ${
              d.data.libraryTracksCount === 0 ? "text-gray-500" : ""
            }`}
          >
            <FaPlay
              size={PLAY_PAUSE_ICON_DIMENSIONS.HEIGHT}
              className="play-icon"
              color={`${d.data.libraryTracksCount === 0 ? "grey" : "white"}`}
            />
          </div>
        );
        const pauseElement = (
          <div className="playpause-container tree-action-icon-container">
            <FaPause size={PLAY_PAUSE_ICON_DIMENSIONS.HEIGHT} className="pause tree-icon" color="white" />
          </div>
        );

        const isThisPlaylistPlaying =
          trackListOrigin &&
          trackListOrigin.type === TRACK_LIST_ORIGIN_TYPE.PLAYLIST &&
          trackListOrigin.object.uuid === d.data.uuid;
        let element;
        if (isThisPlaylistPlaying) {
          if (playState === PLAY_STATES.LOADING) {
            return "";
          }
          element = playState === PLAY_STATES.PLAYING ? pauseElement : playElement;
        } else {
          element = playElement;
        }
        return ReactDOMServer.renderToString(element);
      })
      .style("cursor", function (d) {
        if (d.data.libraryTracksCount > 0) {
          return "pointer";
        }
        return "default";
      });

    playPauseContainerGroup
      .append("foreignObject")
      .attr("x", ACTIONS_CONTAINER_X_OFFSET + ACTION_ICON_CONTAINER_DIMENSIONS.WIDTH)
      .attr("y", -ACTIONS_CONTAINER_DIMENSIONS.HEIGHT / 2 + ACTION_CONTAINER_DIMENSIONS.HEIGHT)
      .attr("width", ACTION_LABEL_CONTAINER_DIMENSIONS.WIDTH)
      .attr("height", ACTION_LABEL_CONTAINER_DIMENSIONS.HEIGHT)
      .html(function (d) {
        return ReactDOMServer.renderToString(
          <div className="playpause-label-container tree-action-label-container">
            {d.data.libraryTracksCount + " track" + (d.data.libraryTracksCount > 1 ? "s" : "")}
          </div>
        );
      });

    const addGenreContainerGroup = actionsContainerGroup
      .append("g")
      .attr("class", "add-genre-container cursor-pointer")
      .on("click", function (event, d) {
        group.dispatch("mouseleave");
        handleAddGenreAction(event, d.data.criteria.uuid);
      })
      .on("mouseover", function () {
        d3.select(this).selectAll("div").classed("bg-gray-500", true);
      })
      .on("mouseout", function () {
        d3.select(this).selectAll("div").classed("bg-gray-500", false);
      });

    addGenreContainerGroup
      .append("foreignObject")
      .attr("x", ACTIONS_CONTAINER_X_OFFSET)
      .attr("y", -ACTIONS_CONTAINER_DIMENSIONS.HEIGHT / 2 + ACTION_CONTAINER_DIMENSIONS.HEIGHT * 2)
      .attr("width", ACTION_ICON_CONTAINER_DIMENSIONS.WIDTH)
      .attr("height", ACTION_ICON_CONTAINER_DIMENSIONS.HEIGHT)
      .html(function () {
        return ReactDOMServer.renderToString(
          <div className="tree-action-icon-container">
            <FaPlus className="tree-icon" size={ACTION_ICON_SIZE} color="white" />
          </div>
        );
      });

    addGenreContainerGroup
      .append("foreignObject")
      .attr("x", ACTIONS_CONTAINER_X_OFFSET + ACTION_ICON_CONTAINER_DIMENSIONS.WIDTH)
      .attr("y", -ACTIONS_CONTAINER_DIMENSIONS.HEIGHT / 2 + ACTION_CONTAINER_DIMENSIONS.HEIGHT * 2)
      .attr("width", ACTION_LABEL_CONTAINER_DIMENSIONS.WIDTH)
      .attr("height", ACTION_LABEL_CONTAINER_DIMENSIONS.HEIGHT)
      .html(function () {
        return ReactDOMServer.renderToString(
          <div className="add-genre-label-container tree-action-label-container">Add genre child</div>
        );
      });

    const changeParentContainerGroup = actionsContainerGroup
      .append("g")
      .attr("class", "change-parent-container cursor-pointer")
      .on("click", function (event, d) {
        group.dispatch("mouseleave");
        setGenreUuidGettingAssignedNewParent(d.data.criteria.uuid);
      })
      .on("mouseover", function () {
        d3.select(this).selectAll("div").classed("bg-gray-500", true);
      })
      .on("mouseout", function () {
        d3.select(this).selectAll("div").classed("bg-gray-500", false);
      });

    changeParentContainerGroup
      .append("foreignObject")
      .attr("x", ACTIONS_CONTAINER_X_OFFSET)
      .attr("y", -ACTIONS_CONTAINER_DIMENSIONS.HEIGHT / 2 + ACTION_CONTAINER_DIMENSIONS.HEIGHT * 3)
      .attr("width", ACTION_ICON_CONTAINER_DIMENSIONS.WIDTH)
      .attr("height", ACTION_ICON_CONTAINER_DIMENSIONS.HEIGHT)
      .html(function () {
        return ReactDOMServer.renderToString(
          <div className="tree-action-icon-container">
            <PiGraphFill className="tree-icon" size={ACTION_ICON_SIZE} color="white" />
          </div>
        );
      });

    changeParentContainerGroup
      .append("foreignObject")
      .attr("x", ACTIONS_CONTAINER_X_OFFSET + ACTION_ICON_CONTAINER_DIMENSIONS.WIDTH)
      .attr("y", -ACTIONS_CONTAINER_DIMENSIONS.HEIGHT / 2 + ACTION_CONTAINER_DIMENSIONS.HEIGHT * 3)
      .attr("width", ACTION_LABEL_CONTAINER_DIMENSIONS.WIDTH)
      .attr("height", ACTION_LABEL_CONTAINER_DIMENSIONS.HEIGHT)
      .html(function () {
        return ReactDOMServer.renderToString(
          <div className="change-parent-label-container tree-action-label-container">New genre parent</div>
        );
      });
  };

  const addMoreIconContainer = (genrePlaylistUuid) => {
    const group = d3.select("#group-" + genrePlaylistUuid);
    let moreIconContainer = group.select("#more-icon-container-" + genrePlaylistUuid);

    if (moreIconContainer.empty()) {
      const moreIconContainer = group.append("g").attr("id", "more-icon-container-" + genrePlaylistUuid);

      const handleMoreAction = (event, d) => {
        const genrePlaylistUuid = d.data.uuid;
        event.stopPropagation();
        const actionsContainer = group.select("#actions-container-" + genrePlaylistUuid);
        if (!actionsContainer.empty()) {
          actionsContainer.remove();
          return;
        } else {
          addActionsContainer(genrePlaylistUuid);
        }
      };

      moreIconContainer
        .append("rect")
        .attr("x", RECT_BASE_DIMENSIONS.WIDTH / 2)
        .attr("y", -RECT_BASE_DIMENSIONS.HEIGHT / 2)
        .attr("width", MORE_ICON_WIDTH)
        .attr("height", RECT_BASE_DIMENSIONS.HEIGHT)
        .attr("fill", RECTANGLE_COLOR);

      moreIconContainer
        .append("foreignObject")
        .attr("x", RECT_BASE_DIMENSIONS.WIDTH / 2)
        .attr("y", -RECT_BASE_DIMENSIONS.HEIGHT / 2)
        .attr("width", MORE_ICON_WIDTH)
        .attr("height", RECT_BASE_DIMENSIONS.HEIGHT)
        .html(function () {
          return ReactDOMServer.renderToString(
            <div className="w-full h-full flex justify-center items-center cursor-pointer hover:bg-gray-500">
              <MdMoreVert size={20} color="white" />
            </div>
          );
        })
        .on("click", handleMoreAction);

      group.on("mouseleave", function (event, d) {
        setPreviousRenderingVisibleActionsContainerGenrePlaylistUuid(null);
        d3.select("#more-icon-container-" + d.id).remove();
        d3.select("#actions-container-" + d.id).remove();
      });
    }
  };

  // Function to create a grid
  function createGrid(svg, width, height, spacing) {
    const gridGroup = svg.append("g").attr("class", "grid");

    // Add horizontal lines and numbers
    for (let y = 0; y <= height; y += spacing) {
      gridGroup
        .append("line")
        .attr("x1", 0)
        .attr("y1", y)
        .attr("x2", width)
        .attr("y2", y)
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1);

      gridGroup
        .append("text")
        .attr("x", 5)
        .attr("y", y - 5)
        .attr("fill", "#000")
        .attr("font-size", "10px")
        .text(y);
    }

    // Add vertical lines and numbers
    for (let x = 0; x <= width; x += spacing) {
      gridGroup
        .append("line")
        .attr("x1", x)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", height)
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1);

      gridGroup
        .append("text")
        .attr("x", x + 5)
        .attr("y", 15)
        .attr("fill", "#000")
        .attr("font-size", "10px")
        .text(x);
    }
  }

  useEffect(() => {
    const root = buildTreeHierarchy();

    // Here in the tree layout, x is vertical and y is horizontal.
    const treeLayout = d3.tree().nodeSize([VERTICAL_SEPARATOON_BETWEEN_NODES, HORIZONTAL_SEPARATOON_BETWEEN_NODES]);
    const treeData = treeLayout(root);

    const highestNodeVerticalCoordinate = d3.min(treeData.descendants(), (d) => d.x);
    const highestVerticalCoordinate =
      highestNodeVerticalCoordinate + RECT_BASE_DIMENSIONS.HEIGHT / 2 - ACTIONS_CONTAINER_DIMENSIONS.HEIGHT / 2;
    const lowestNodeVerticalCoordinate = d3.max(treeData.descendants(), (d) => d.x);
    const lowestVerticalCoordinate =
      lowestNodeVerticalCoordinate + RECT_BASE_DIMENSIONS.HEIGHT / 2 + ACTIONS_CONTAINER_DIMENSIONS.HEIGHT / 2;
    svgHeight.current = lowestVerticalCoordinate - highestVerticalCoordinate;

    const maximumLevel = d3.max(treeData.descendants(), (d) => d.depth);
    svgWidth.current =
      maximumLevel * HORIZONTAL_SEPARATOON_BETWEEN_NODES +
      RECT_BASE_DIMENSIONS.WIDTH +
      MORE_ICON_WIDTH +
      ACTIONS_CONTAINER_DIMENSIONS.WIDTH;

    // The tree layout has x as vertical and y as horizontal whereas svg logic is the opposite.
    // Therefore, we need to swap x and y.
    treeData.each(function (d) {
      const tempX = d.x;
      d.x = d.y;
      d.y = tempX - highestVerticalCoordinate;
    });
    // Now in the tree layout, x is horizontal and y is vertical as in the svg logic.

    const gridSpacing = 50;

    const svg = d3
      .select(svgRef.current)
      .append("svg")
      .attr("width", svgWidth.current)
      .attr("height", svgHeight.current)
      .append("g");

    createGrid(svg, svgWidth.current, svgHeight.current, gridSpacing);

    const linkGenerator = d3
      .linkHorizontal()
      .x((d) => d.x + RECT_BASE_DIMENSIONS.WIDTH / 2)
      .y((d) => d.y + RECT_BASE_DIMENSIONS.HEIGHT / 2);

    svg
      .selectAll("path.link")
      .data(treeData.links())
      .enter()
      .append("path")
      .attr("d", linkGenerator)
      .style("fill", "none") // Ensure no fill
      .style("stroke", "black") // Set stroke color to red
      .style("stroke-opacity", 1) // Set stroke opacity
      .style("stroke-width", 2); // Set stroke width

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
    nodes
      .append("rect")
      .attr("class", "node-base-rect")
      .attr("width", RECT_BASE_DIMENSIONS.WIDTH)
      .attr("height", RECT_BASE_DIMENSIONS.HEIGHT)
      .attr("x", -RECT_BASE_DIMENSIONS.WIDTH / 2)
      .attr("y", -RECT_BASE_DIMENSIONS.HEIGHT / 2)
      .attr("fill", RECTANGLE_COLOR)
      .style("stroke", function (d) {
        return d.data.criteria &&
          genreUuidGettingAssignedNewParent &&
          genreUuidGettingAssignedNewParent !== d.data.criteria.uuid
          ? "blue"
          : "none";
      })
      .style("stroke-width", function (d) {
        return genreUuidGettingAssignedNewParent &&
          d.data.criteria &&
          genreUuidGettingAssignedNewParent !== d.data.criteria.uuid
          ? "2px"
          : "0px";
      });

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
      .on("mouseover", function (event, d) {
        if (genreUuidGettingAssignedNewParent) {
          if (d.data.criteria && genreUuidGettingAssignedNewParent !== d.data.criteria.uuid) {
            const parentNode = d3.select(this.parentNode);
            let selectAsNewParentGroup = parentNode.select("#select-as-new-parent-group");
            if (selectAsNewParentGroup.empty()) {
              selectAsNewParentGroup = parentNode
                .append("g")
                .attr("class", "select-as-new-parent-group  cursor-pointer")
                .on("mouseleave", function () {
                  d3.select(this).remove();
                });

              selectAsNewParentGroup
                .append("rect")
                .attr("class", "select-as-new-parent-layer")
                .attr("width", RECT_BASE_DIMENSIONS.WIDTH)
                .attr("height", RECT_BASE_DIMENSIONS.HEIGHT)
                .attr("x", -RECT_BASE_DIMENSIONS.WIDTH / 2)
                .attr("y", -RECT_BASE_DIMENSIONS.HEIGHT / 2)
                .attr("fill", "grey");

              selectAsNewParentGroup
                .append("foreignObject")
                .attr("class", "select-as-new-parent-icon-foreign-obj")
                .attr("width", RECT_BASE_DIMENSIONS.WIDTH)
                .attr("height", RECT_BASE_DIMENSIONS.HEIGHT)
                .attr("x", -RECT_BASE_DIMENSIONS.WIDTH / 2)
                .attr("y", -RECT_BASE_DIMENSIONS.HEIGHT / 2)
                .attr("fill", "grey")
                .html(function () {
                  return ReactDOMServer.renderToString(
                    <div className="select-as-new-parent-layer-icon-container h-full w-full flex items-center justify-center">
                      <PiGraphFill size={20} color="white" />
                      <div className="select-as-new-parent-layer-icon-label text-white text-xs ml-2">
                        Select as new parent
                      </div>
                    </div>
                  );
                })
                .on("click", function (event, d) {
                  updateGenreParent(genreUuidGettingAssignedNewParent, d.data.criteria.uuid);
                  setGenreUuidGettingAssignedNewParent(null);
                });
            }
          }
        } else {
          setPreviousRenderingVisibleActionsContainerGenrePlaylistUuid(d.data.uuid);
          addMoreIconContainer(d.data.uuid);
        }
      });

    if (previousRenderingVisibleActionsContainerGenrePlaylistUuid) {
      addMoreIconContainer(previousRenderingVisibleActionsContainerGenrePlaylistUuid);
      addActionsContainer(previousRenderingVisibleActionsContainerGenrePlaylistUuid);
    }

    return () => {
      svg.selectAll("*").remove();
    };
  }, [genrePlaylistsTree, playState, trackListOrigin, genreUuidGettingAssignedNewParent]);

  return (
    <div>
      <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
      <svg ref={svgRef} width={svgWidth.current} height={svgHeight.current} className="mt-5"></svg>
    </div>
  );
}

GenrePlaylistsTree.propTypes = {
  genrePlaylistsTree: PropTypes.array.isRequired,
};
