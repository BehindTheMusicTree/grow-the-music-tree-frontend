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
  const ACTIONS_EXTRA_RECT_WIDTH = 20;
  const NODE_DIMENSIONS = {
    WIDTH: RECT_BASE_DIMENSIONS.WIDTH + ACTIONS_EXTRA_RECT_WIDTH,
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
      numberOfLevels * HORIZONTAL_SEPARATOON_BETWEEN_NODES + RECT_BASE_DIMENSIONS.WIDTH + ACTIONS_EXTRA_RECT_WIDTH;
    const lowestNodeX = calculateLowestNodeX(treeData);
    const highestNodeX = calculateHighestNodeX(treeData);

    const xGap = lowestNodeX - highestNodeX;
    const svgHeight = xGap + RECT_BASE_DIMENSIONS.HEIGHT;

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
      .attr("width", NODE_DIMENSIONS.WIDTH)
      .attr("height", NODE_DIMENSIONS.HEIGHT)
      .attr("x", -RECT_BASE_DIMENSIONS.WIDTH / 2)
      .attr("y", -RECT_BASE_DIMENSIONS.HEIGHT / 2)
      .attr("fill", "none");

    nodes
      .append("rect")
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
      .attr("class", "w-4 h-4 flex justify-center items-center")
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
              <FaPlay size={PLAY_PAUSE_ICON_DIMENSIONS.HEIGHT} className="play tree-node-icon" />
            );
          return ReactDOMServer.renderToString(element);
        }
        return ReactDOMServer.renderToString(
          <FaPlay size={PLAY_PAUSE_ICON_DIMENSIONS.HEIGHT} className="play tree-node-icon" />
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

    const GENRE_ADD_PLUS_ICON_DIMENSIONS = {
      WIDTH: 14,
      HEIGHT: 16,
    };

    nodes
      .append("foreignObject")
      .attr("class", "genre-add tree-node-icon-container")
      .attr("width", GENRE_ADD_PLUS_ICON_DIMENSIONS.WIDTH)
      .attr("height", GENRE_ADD_PLUS_ICON_DIMENSIONS.HEIGHT)
      .attr("dominant-baseline", "middle")
      .attr("text-anchor", "middle")
      .attr("x", RECT_BASE_DIMENSIONS.WIDTH / 2 - GENRE_ADD_ICON_OFFSET - GENRE_ADD_PLUS_ICON_DIMENSIONS.WIDTH / 2)
      .attr("y", -(RECT_BASE_DIMENSIONS.HEIGHT - GENRE_ADD_PLUS_ICON_DIMENSIONS.HEIGHT) / 2)
      .html(function () {
        return ReactDOMServer.renderToString(
          <FaPlus className="tree-node-icon" size={GENRE_ADD_PLUS_ICON_DIMENSIONS.WIDTH} />
        );
      })
      .style("display", "none")
      .on("click", function (event, d) {
        handleGenreAddAction(event, d.data.criteria.uuid);
      });

    const TRACK_UPLOAD_ICON_DIMENSIONS = {
      WIDTH: 14,
      HEIGHT: 16,
    };

    nodes
      .append("foreignObject")
      .attr("class", "track-upload tree-node-icon-container")
      .attr("width", TRACK_UPLOAD_ICON_DIMENSIONS.WIDTH)
      .attr("height", TRACK_UPLOAD_ICON_DIMENSIONS.HEIGHT)
      .attr("dominant-baseline", "middle")
      .attr("x", RECT_BASE_DIMENSIONS.WIDTH / 2 - TRACK_UPLOAD_ICON_OFFSET - TRACK_UPLOAD_ICON_DIMENSIONS.WIDTH / 2)
      .attr("y", -(RECT_BASE_DIMENSIONS.HEIGHT - TRACK_UPLOAD_ICON_DIMENSIONS.HEIGHT) / 2)
      .html(function () {
        return ReactDOMServer.renderToString(
          <FaFileUpload className="tree-node-icon" size={TRACK_UPLOAD_ICON_DIMENSIONS.WIDTH} />
        );
      })
      .style("display", "none")
      .on("click", function (event, d) {
        event.stopPropagation();
        selectingFileGenreUuidRef.current = d.data.criteria.uuid;
        fileInputRef.current.click();
      });

    nodes
      .on("mouseover", function () {
        const group = d3.select(this);
        group
          .append("rect")
          .attr("x", RECT_BASE_DIMENSIONS.WIDTH / 2)
          .attr("y", -RECT_BASE_DIMENSIONS.HEIGHT / 2)
          .attr("width", ACTIONS_EXTRA_RECT_WIDTH)
          .attr("height", RECT_BASE_DIMENSIONS.HEIGHT)
          .html(function () {
            return ReactDOMServer.renderToString(
              <div className="flex justify-center items-center">
                <MdMoreVert size={20} color="white" />
              </div>
            );
          })
          .attr("class", "more-container");
      })
      .on("mouseout", function () {
        d3.select(this).select(".more-container").remove();
      });

    // const iconClassesToShowOnHover = ".genre-add, .track-upload";
    // nodes
    //   .on("mouseover", function () {
    //     d3.select(this).selectAll(iconClassesToShowOnHover).style("display", "flex");
    //   })
    //   .on("mouseout", function () {
    //     d3.select(this).selectAll(iconClassesToShowOnHover).style("display", "none");
    //   });

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
