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
import {
  PLAY_STATES,
  TRACK_LIST_ORIGIN_TYPE,
  GENRE_PLAYLIST_TREE_RECT_DIMENSIONS as RECT_BASE_DIMENSIONS,
} from "../../../../../utils/constants";
import {
  VERTICAL_SEPARATOON_BETWEEN_NODES,
  HORIZONTAL_SEPARATOON_BETWEEN_NODES,
  MORE_ICON_WIDTH,
  ACTIONS_CONTAINER_X_OFFSET,
  ACTIONS_CONTAINER_DIMENSIONS,
  ACTION_ICON_CONTAINER_DIMENSIONS,
  ACTION_ICON_SIZE,
} from "../../../../../utils/tree-dimensions";
import { PRIMARY_COLOR } from "../../../../../utils/theme";
import LibTrackUploadPopupContentObject from "../../../../../models/popup-content-object/LibTrackUploadPopupContentObject";

export default function GenrePlaylistsTree({ genrePlaylistsTree }) {
  const RECTANGLE_COLOR = PRIMARY_COLOR;

  const { playState } = usePlayer();
  const { showPopup } = usePopup();
  const { handleGenreAddAction } = useGenrePlaylists();
  const { playNewTrackListFromPlaylistUuid, origin: trackListOrigin } = useTrackList();
  const [previousRenderingVisibleActionsContainerNodeId, setPreviousRenderingVisibleActionsContainerNodeId] =
    useState(null);

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

  const addActionsContainer = (nodes, genrePlaylistId) => {
    let group = nodes.append("g").attr("id", "actions-container-" + genrePlaylistId);

    group
      .append("rect")
      .attr("id", "actions-background")
      .attr("x", ACTIONS_CONTAINER_X_OFFSET)
      .attr("y", -ACTIONS_CONTAINER_DIMENSIONS.HEIGHT / 2)
      .attr("width", ACTIONS_CONTAINER_DIMENSIONS.WIDTH)
      .attr("height", ACTIONS_CONTAINER_DIMENSIONS.HEIGHT)
      .attr("fill", RECTANGLE_COLOR);

    group
      .append("path")
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

    group
      .append("path")
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

    group
      .append("foreignObject")
      .attr("class", "upload-track")
      .attr("x", ACTIONS_CONTAINER_X_OFFSET)
      .attr("y", -ACTIONS_CONTAINER_DIMENSIONS.HEIGHT / 2)
      .attr("width", ACTION_ICON_CONTAINER_DIMENSIONS.WIDTH)
      .attr("height", ACTION_ICON_CONTAINER_DIMENSIONS.HEIGHT)
      .html(function () {
        return ReactDOMServer.renderToString(
          <div className="tree-node-icon-container">
            <FaFileUpload className="tree-node-icon" size={ACTION_ICON_SIZE} color="white" />
          </div>
        );
      })
      .on("click", function (event, d) {
        event.stopPropagation();
        selectingFileGenreUuidRef.current = d.data.criteria.uuid;
        fileInputRef.current.click();
        nodes.dispatch("mouseleave");
      });

    const SPINNER_ICON_SIZE = 14;
    const PLAY_PAUSE_SPINNER_Y = -ACTIONS_CONTAINER_DIMENSIONS.HEIGHT / 2 + ACTION_ICON_CONTAINER_DIMENSIONS.HEIGHT;
    group
      .append("foreignObject")
      .attr("x", ACTIONS_CONTAINER_X_OFFSET)
      .attr("y", PLAY_PAUSE_SPINNER_Y)
      .attr("width", ACTION_ICON_CONTAINER_DIMENSIONS.WIDTH)
      .attr("height", ACTION_ICON_CONTAINER_DIMENSIONS.HEIGHT)
      .attr("dominant-baseline", "middle")
      .html(function (d) {
        if (
          trackListOrigin &&
          trackListOrigin.type === TRACK_LIST_ORIGIN_TYPE.PLAYLIST &&
          trackListOrigin.object.uuid === d.data.uuid &&
          playState === PLAY_STATES.LOADING
        ) {
          return ReactDOMServer.renderToString(
            <div className="spinner-container tree-node-icon-container">
              <FaSpinner size={SPINNER_ICON_SIZE} className="animate-spin fill-current text-white" />
            </div>
          );
        }
      });

    const PLAY_PAUSE_ICON_DIMENSIONS = {
      WIDTH: 12,
      HEIGHT: 12,
    };
    group
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
          <div className="playpause-container tree-node-icon-container">
            <FaPlay size={PLAY_PAUSE_ICON_DIMENSIONS.HEIGHT} className="play tree-node-icon" color="white" />
          </div>
        );
        const pauseElement = (
          <div className="playpause-container tree-node-icon-container">
            <FaPause size={PLAY_PAUSE_ICON_DIMENSIONS.HEIGHT} className="pause tree-node-icon" color="white" />
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
      .on("click", function (event, d) {
        event.stopPropagation();
        handlePlayPauseIconAction(d.data);
      })
      .style("cursor", function (d) {
        if (d.data.libraryTracksCount > 0) {
          return "pointer";
        }
        return "default";
      });

    const PLAYLIST_TRACKS_COUNT_TEXT_DIMENSIONS = {
      WIDTH: 14,
      HEIGHT: 16,
    };

    group
      .append("foreignObject")
      .attr("class", "playlist-count tree-node-info-container")
      .attr("x", ACTIONS_CONTAINER_X_OFFSET + ACTION_ICON_CONTAINER_DIMENSIONS.WIDTH)
      .attr("y", -ACTION_ICON_CONTAINER_DIMENSIONS / 2)
      .attr("width", PLAYLIST_TRACKS_COUNT_TEXT_DIMENSIONS.WIDTH)
      .attr("height", PLAYLIST_TRACKS_COUNT_TEXT_DIMENSIONS.HEIGHT)
      .html(function (d) {
        return `<div class="tree-node-info">` + d.data.libraryTracksCount + "</div>";
      });

    group
      .append("foreignObject")
      .attr("class", "genre-add")
      .attr("x", ACTIONS_CONTAINER_X_OFFSET)
      .attr("y", -ACTIONS_CONTAINER_DIMENSIONS.HEIGHT / 2 + ACTION_ICON_CONTAINER_DIMENSIONS / 2)
      .attr("width", ACTION_ICON_CONTAINER_DIMENSIONS.WIDTH)
      .attr("height", ACTION_ICON_CONTAINER_DIMENSIONS.HEIGHT)
      .html(function () {
        return ReactDOMServer.renderToString(
          <div className="tree-node-icon-container">
            <FaPlus className="tree-node-icon" size={ACTION_ICON_SIZE} color="white" />
          </div>
        );
      })
      .on("click", function (event, d) {
        nodes.dispatch("mouseleave");
        handleGenreAddAction(event, d.data.criteria.uuid);
      });
  };

  const addMoreIconContainer = (nodes, genrePlaylistId) => {
    let moreIconContainer = nodes.select("#more-icon-container-" + genrePlaylistId);

    if (moreIconContainer.empty()) {
      const moreIconContainer = nodes.append("g").attr("id", "more-icon-container-" + genrePlaylistId);

      const handleMoreAction = (event, d) => {
        event.stopPropagation();
        const actionsContainer = nodes.select("#actions-container-" + genrePlaylistId);
        if (!actionsContainer.empty()) {
          console.log("removing");
          actionsContainer.remove();
          return;
        } else {
          addActionsContainer(nodes, d.id);
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
            <div className="w-full h-full flex justify-center items-center cursor-pointer">
              <MdMoreVert size={20} color="white" />
            </div>
          );
        })
        .on("click", handleMoreAction);

      nodes.on("mouseleave", function (event, d) {
        setPreviousRenderingVisibleActionsContainerNodeId(null);
        d3.select("#more-icon-container-" + d.id).remove();
        d3.select("#actions-container-" + d.id).remove();
      });
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

    const GENRE_NAME_DIMENSIONS = {
      WIDTH: RECT_BASE_DIMENSIONS.WIDTH - 20,
      HEIGHT: RECT_BASE_DIMENSIONS.HEIGHT,
    };

    nodes
      .append("foreignObject")
      .attr("class", "tree-node-info-container")
      .attr("width", GENRE_NAME_DIMENSIONS.WIDTH)
      .attr("height", GENRE_NAME_DIMENSIONS.HEIGHT)
      .attr("x", -RECT_BASE_DIMENSIONS.WIDTH / 2)
      .attr("y", -RECT_BASE_DIMENSIONS.HEIGHT / 2)
      .html(function (d) {
        return `<div class="tree-node-info">${d.data.name}</div>`;
      });

    nodes
      .append("rect")
      .attr("class", "node-base-rect-mouseover")
      .attr("width", RECT_BASE_DIMENSIONS.WIDTH)
      .attr("height", RECT_BASE_DIMENSIONS.HEIGHT)
      .attr("x", -RECT_BASE_DIMENSIONS.WIDTH / 2)
      .attr("y", -RECT_BASE_DIMENSIONS.HEIGHT / 2)
      .attr("fill", "rgba(0, 0, 0, 0)")
      .on("mouseover", function (event, d) {
        setPreviousRenderingVisibleActionsContainerNodeId(d.id);
        addMoreIconContainer(nodes, d.id);
      });

    if (previousRenderingVisibleActionsContainerNodeId) {
      addMoreIconContainer(nodes, previousRenderingVisibleActionsContainerNodeId);
      addActionsContainer(nodes, previousRenderingVisibleActionsContainerNodeId);
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
