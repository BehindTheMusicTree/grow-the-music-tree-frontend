import { useEffect, useRef } from "react";
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
import { PRIMARY_COLOR } from "../../../../../utils/theme";
import LibTrackUploadPopupContentObject from "../../../../../models/popup-content-object/LibTrackUploadPopupContentObject";

export default function GenrePlaylistsTree({ genrePlaylistsTree }) {
  const RECTANGLE_COLOR = PRIMARY_COLOR;
  const ACTION_ICON_SIZE = 14;
  const ACTION_ICON_CONTAINER_DIMENSIONS = {
    WIDTH: ACTION_ICON_SIZE + 12,
    HEIGHT: RECT_BASE_DIMENSIONS.HEIGHT,
  };
  const MORE_ICON_WIDTH = 22;
  const ACTIONS_CONTAINER_DIMENSIONS = {
    WIDTH: ACTION_ICON_CONTAINER_DIMENSIONS.WIDTH,
    HEIGHT: ACTION_ICON_CONTAINER_DIMENSIONS.HEIGHT * 3,
  };
  const NODE_DIMENSIONS = {
    WIDTH: RECT_BASE_DIMENSIONS.WIDTH + MORE_ICON_WIDTH + ACTIONS_CONTAINER_DIMENSIONS.WIDTH,
    HEIGHT: RECT_BASE_DIMENSIONS.HEIGHT,
  };
  const HORIZONTAL_SEPARATOON_BETWEEN_RECTANGLES = 20;
  const VERTICAL_SEPARATOON_BETWEEN_RECTANGLES = 20;
  const HORIZONTAL_SEPARATOON_BETWEEN_NODES = NODE_DIMENSIONS.WIDTH + HORIZONTAL_SEPARATOON_BETWEEN_RECTANGLES;
  const VERTICAL_SEPARATOON_BETWEEN_NODES = NODE_DIMENSIONS.HEIGHT + VERTICAL_SEPARATOON_BETWEEN_RECTANGLES;

  const { playState } = usePlayer();
  const { showPopup } = usePopup();
  const { handleGenreAddAction } = useGenrePlaylists();
  const { playNewTrackListFromPlaylistUuid, origin: trackListOrigin } = useTrackList();
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

    const TRACK_UPLOAD_ICON_OFFSET = 10;
    const GENRE_ADD_ICON_OFFSET = TRACK_UPLOAD_ICON_OFFSET + 17;
    const PLAYLIST_TRACKS_COUNT_TEXT_OFFSET = GENRE_ADD_ICON_OFFSET + 20;
    const PLAY_PAUSE_BUTTON_OFFSET = PLAYLIST_TRACKS_COUNT_TEXT_OFFSET + 13;

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

    const SPINNER_ICON_SIZE = 14;
    nodes
      .append("foreignObject")
      .attr("class", "spinner w-4 h-4 flex justify-center items-center")
      .attr("width", SPINNER_ICON_SIZE)
      .attr("height", SPINNER_ICON_SIZE)
      .attr("dominant-baseline", "middle")
      .attr("x", RECT_BASE_DIMENSIONS.WIDTH / 2 - PLAY_PAUSE_BUTTON_OFFSET)
      .attr("y", -SPINNER_ICON_SIZE / 2)
      .html(function (d) {
        if (
          trackListOrigin &&
          trackListOrigin.type === TRACK_LIST_ORIGIN_TYPE.PLAYLIST &&
          trackListOrigin.object.uuid === d.data.uuid &&
          playState === PLAY_STATES.LOADING
        ) {
          return ReactDOMServer.renderToString(
            <FaSpinner size={SPINNER_ICON_SIZE} className="animate-spin fill-current text-white" />
          );
        }
      });

    const PLAY_PAUSE_ICON_DIMENSIONS = {
      WIDTH: 12,
      HEIGHT: 12,
    };
    nodes
      .append("foreignObject")
      .attr("class", "playpause tree-node-icon-container")
      .attr("width", PLAY_PAUSE_ICON_DIMENSIONS.WIDTH)
      .attr("height", PLAY_PAUSE_ICON_DIMENSIONS.HEIGHT)
      .attr("x", RECT_BASE_DIMENSIONS.WIDTH / 2 - PLAY_PAUSE_BUTTON_OFFSET)
      .attr("y", -PLAY_PAUSE_ICON_DIMENSIONS.HEIGHT / 2)
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

        if (
          trackListOrigin &&
          trackListOrigin.type === TRACK_LIST_ORIGIN_TYPE.PLAYLIST &&
          trackListOrigin.object.uuid === d.data.uuid
        ) {
          if (playState === PLAY_STATES.LOADING) {
            return "";
          }
          const element =
            playState === PLAY_STATES.PLAYING ? (
              <FaPause size={PLAY_PAUSE_ICON_DIMENSIONS.HEIGHT} className="pause tree-node-icon" />
            ) : (
              <FaPlay size={PLAY_PAUSE_ICON_DIMENSIONS.HEIGHT} className="play tree-node-icon cursor-pointer" />
            );
          return ReactDOMServer.renderToString(element);
        }
        return ReactDOMServer.renderToString(
          <FaPlay size={PLAY_PAUSE_ICON_DIMENSIONS.HEIGHT} className="play tree-node-icon cursor-pointer" />
        );
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
    nodes
      .append("foreignObject")
      .attr("class", "playlist-count tree-node-info-container")
      .attr("width", PLAYLIST_TRACKS_COUNT_TEXT_DIMENSIONS.WIDTH)
      .attr("height", PLAYLIST_TRACKS_COUNT_TEXT_DIMENSIONS.HEIGHT)
      .attr("x", RECT_BASE_DIMENSIONS.WIDTH / 2 - PLAYLIST_TRACKS_COUNT_TEXT_OFFSET)
      .attr("y", -PLAYLIST_TRACKS_COUNT_TEXT_DIMENSIONS.HEIGHT / 2)
      .html(function (d) {
        return `<div class="tree-node-info">` + d.data.libraryTracksCount + "</div>";
      });

    const ACTIONS_CONTAINER_X_OFFSET = RECT_BASE_DIMENSIONS.WIDTH / 2 + MORE_ICON_WIDTH;
    nodes
      .append("rect")
      .attr("class", "node-base-rect-mouseover")
      .attr("width", RECT_BASE_DIMENSIONS.WIDTH)
      .attr("height", RECT_BASE_DIMENSIONS.HEIGHT)
      .attr("x", -RECT_BASE_DIMENSIONS.WIDTH / 2)
      .attr("y", -RECT_BASE_DIMENSIONS.HEIGHT / 2)
      .attr("fill", "rgba(0, 0, 0, 0)")
      .on("mouseover", function (event, d) {
        const group = d3.select(this.parentNode);
        let moreIconContainer = group.select("#more-icon-container-" + d.id);

        if (moreIconContainer.empty()) {
          const existingContainer = group.append("g").attr("id", "more-icon-container-" + d.id);

          const handleMoreClick = (event, d) => {
            event.stopPropagation();
            const parent = d3.select(event.currentTarget.parentNode);
            const existingContainer = parent.select("#actions-container-" + d.id);

            if (!existingContainer.empty()) {
              console.log("removing");
              group.dispatch("mouseleave");
              return;
            } else {
              parent
                .append("rect")
                .attr("id", "actions-container-" + d.id)
                .attr("x", ACTIONS_CONTAINER_X_OFFSET)
                .attr("y", -ACTIONS_CONTAINER_DIMENSIONS.HEIGHT / 2)
                .attr("width", ACTIONS_CONTAINER_DIMENSIONS.WIDTH)
                .attr("height", ACTIONS_CONTAINER_DIMENSIONS.HEIGHT)
                .attr("fill", RECTANGLE_COLOR);

              parent
                .append("foreignObject")
                .attr("class", "genre-add")
                .attr("x", ACTIONS_CONTAINER_X_OFFSET)
                .attr("y", -RECT_BASE_DIMENSIONS.HEIGHT / 2)
                .attr("width", ACTION_ICON_CONTAINER_DIMENSIONS.WIDTH)
                .attr("height", ACTION_ICON_CONTAINER_DIMENSIONS.HEIGHT)
                .html(function () {
                  return ReactDOMServer.renderToString(
                    <div className="tree-node-icon-container w-full h-full flex justify-center items-center cursor-pointer">
                      <FaPlus className="tree-node-icon" size={ACTION_ICON_SIZE} color="white" />
                    </div>
                  );
                })
                .on("click", function (event, d) {
                  group.dispatch("mouseleave");
                  handleGenreAddAction(event, d.data.criteria.uuid);
                });

              parent
                .append("foreignObject")
                .attr("class", "upload-track")
                .attr("x", ACTIONS_CONTAINER_X_OFFSET)
                .attr("y", -RECT_BASE_DIMENSIONS.HEIGHT / 2 - ACTION_ICON_CONTAINER_DIMENSIONS.HEIGHT)
                .attr("width", ACTION_ICON_CONTAINER_DIMENSIONS.WIDTH)
                .attr("height", ACTION_ICON_CONTAINER_DIMENSIONS.HEIGHT)
                .html(function () {
                  return ReactDOMServer.renderToString(
                    <div className="tree-node-icon-container h-full w-full flex justify-center items-center cursor-pointer">
                      <FaFileUpload className="tree-node-icon" size={ACTION_ICON_SIZE} color="white" />
                    </div>
                  );
                })
                .on("click", function (event, d) {
                  event.stopPropagation();
                  selectingFileGenreUuidRef.current = d.data.criteria.uuid;
                  fileInputRef.current.click();
                  group.dispatch("mouseleave");
                });
            }
          };

          existingContainer
            .append("rect")
            .attr("x", RECT_BASE_DIMENSIONS.WIDTH / 2)
            .attr("y", -RECT_BASE_DIMENSIONS.HEIGHT / 2)
            .attr("width", MORE_ICON_WIDTH)
            .attr("height", RECT_BASE_DIMENSIONS.HEIGHT)
            .attr("fill", RECTANGLE_COLOR);

          existingContainer
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
            .on("click", handleMoreClick);

          group.on("mouseleave", function (event, d) {
            const container = d3.select("#more-icon-container-" + d.id);
            container.remove();
          });
        }
      });

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
