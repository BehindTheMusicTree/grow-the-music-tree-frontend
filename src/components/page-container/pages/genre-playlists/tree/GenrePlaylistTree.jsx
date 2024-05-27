import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import ReactDOMServer from "react-dom/server";

import * as d3 from "d3";
import { FaSpinner, FaFileUpload, FaPlus, FaPlay, FaPause } from "react-icons/fa";
import { MdMoreVert } from "react-icons/md";

import { usePopup } from "../../../../../contexts/popup/usePopup";
import { useTrackList } from "../../../../../contexts/track-list/useTrackList";
import { useGenrePlaylists } from "../../../../../contexts/genre-playlists/useGenrePlaylists";
import { usePlayer } from "../../../../../contexts/player/usePlayer";
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

  const { playState } = usePlayer();
  const { showPopup } = usePopup();
  const { handleGenreAddAction: handleAddGenreAction } = useGenrePlaylists();
  const { playNewTrackListFromPlaylistUuid, origin: trackListOrigin } = useTrackList();
  const [
    previousRenderingVisibleActionsContainerGenrePlaylistUuid,
    setPreviousRenderingVisibleActionsContainerGenrePlaylistUuid,
  ] = useState(null);

  const svgRef = useRef(null);
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

  const calculateHighestNodeX = (treeData) => {
    let xMin = treeData.descendants()[0].x;
    treeData.each((node) => {
      if (node.x < xMin) {
        xMin = node.x;
      }
    });
    return xMin;
  };

  const calculateLowestNodeX = (treeData) => {
    let xMax = treeData.descendants()[0].x;
    treeData.each((node) => {
      if (node.x > xMax) {
        xMax = node.x;
      }
    });
    return xMax;
  };

  const handlePlayPauseIconAction = (genrePlaylist) => {
    if (
      !trackListOrigin ||
      playState === PLAY_STATES.STOPPED ||
      trackListOrigin.type !== TRACK_LIST_ORIGIN_TYPE.PLAYLIST ||
      trackListOrigin.uuid !== genrePlaylist.uuid
    ) {
      if (genrePlaylist.libraryTracksCount > 0) {
        playNewTrackListFromPlaylistUuid(genrePlaylist.uuid);
      }
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
      .attr("class", "playpause-container cursor-pointer")
      .on("click", function (event, d) {
        event.stopPropagation();
        handlePlayPauseIconAction(d.data);
      })
      .on("mouseover", function () {
        d3.select(this).selectAll("div").classed("bg-gray-500", true);
      })
      .on("mouseout", function () {
        d3.select(this).selectAll("div").classed("bg-gray-500", false);
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
            <div className="spinner-container tree-action-container">
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
        if (d.data.libraryTracksCount === 0) {
          return "";
        }

        const playElement = (
          <div className="playpause-container tree-action-container">
            <FaPlay size={PLAY_PAUSE_ICON_DIMENSIONS.HEIGHT} className="play tree-icon" color="white" />
          </div>
        );
        const pauseElement = (
          <div className="playpause-container tree-action-container">
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
          <div className="tree-action-container">
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
          console.log("removing");
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

      // group.on("mouseleave", function (event, d) {
      //   setPreviousRenderingVisibleActionsContainerGenrePlaylistUuid(null);
      //   d3.select("#more-icon-container-" + d.id).remove();
      //   d3.select("#actions-container-" + d.id).remove();
      // });
    }
  };

  useEffect(() => {
    const root = buildTreeHierarchy();
    const treeData = d3.tree().nodeSize([VERTICAL_SEPARATOON_BETWEEN_NODES, HORIZONTAL_SEPARATOON_BETWEEN_NODES])(root);

    const numberOfLevels = root.height;

    const svgWidth =
      numberOfLevels * HORIZONTAL_SEPARATOON_BETWEEN_NODES +
      RECT_BASE_DIMENSIONS.WIDTH +
      MORE_ICON_WIDTH +
      ACTIONS_CONTAINER_DIMENSIONS.WIDTH;
    const lowestNodeX = calculateLowestNodeX(treeData);
    const highestNodeX = calculateHighestNodeX(treeData);

    const xGap = lowestNodeX - highestNodeX;
    const svgHeight = xGap + ACTIONS_CONTAINER_DIMENSIONS.HEIGHT;

    const xExtremum = Math.max(Math.abs(lowestNodeX), Math.abs(highestNodeX));
    const xShift = xExtremum - xGap / 2;

    const svg = d3.select(svgRef.current).attr("width", svgWidth).attr("height", svgHeight);

    let nodeY;

    let firstNodeXCorrected = treeData.descendants()[0].x - xShift;

    const linkGenerator = d3
      .linkHorizontal()
      .x((d) => d.y + RECT_BASE_DIMENSIONS.WIDTH / 2)
      .y((d) => d.x - firstNodeXCorrected + svgHeight / 2);

    svg
      .selectAll("path.link")
      .data(treeData.links())
      .enter()
      .append("path")
      .attr("class", "fill-current stroke-current stroke-opacity-40 stroke-2")
      .attr("d", linkGenerator);

    const nodes = svg
      .selectAll("g.node")
      .data(treeData.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("id", (d) => "group-" + d.data.uuid)
      .attr("transform", function (d) {
        nodeY = RECT_BASE_DIMENSIONS.WIDTH / 2 + HORIZONTAL_SEPARATOON_BETWEEN_NODES * d.depth;
        return "translate(" + nodeY + "," + (d.x - firstNodeXCorrected + svgHeight / 2) + ")";
      });

    nodes
      .append("rect")
      .attr("class", "node-base-rect")
      .attr("width", RECT_BASE_DIMENSIONS.WIDTH)
      .attr("height", RECT_BASE_DIMENSIONS.HEIGHT)
      .attr("x", -RECT_BASE_DIMENSIONS.WIDTH / 2)
      .attr("y", -RECT_BASE_DIMENSIONS.HEIGHT / 2)
      .attr("fill", RECTANGLE_COLOR);

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
        setPreviousRenderingVisibleActionsContainerGenrePlaylistUuid(d.data.uuid);
        addMoreIconContainer(d.data.uuid);
      });

    if (previousRenderingVisibleActionsContainerGenrePlaylistUuid) {
      addMoreIconContainer(previousRenderingVisibleActionsContainerGenrePlaylistUuid);
      addActionsContainer(previousRenderingVisibleActionsContainerGenrePlaylistUuid);
    }

    return () => {
      svg.selectAll("*").remove();
    };
  }, [genrePlaylistsTree, playState, trackListOrigin]);

  return (
    <div>
      <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
      <svg ref={svgRef} width="600" height="400" className="mt-5"></svg>
    </div>
  );
}

GenrePlaylistsTree.propTypes = {
  genrePlaylistsTree: PropTypes.array.isRequired,
};
