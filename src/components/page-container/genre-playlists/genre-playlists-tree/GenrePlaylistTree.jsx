import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import ReactDOMServer from "react-dom/server";

import * as d3 from "d3";
import { FaSpinner, FaFileUpload, FaPlus, FaPlay, FaPause } from "react-icons/fa";

import { usePopup } from "../../../../../contexts/popup/usePopup.jsx";
import { useTrackList } from "../../../../../contexts/track-list/useTrackList.jsx";
import { useGenrePlaylists } from "../../../../../contexts/genre-playlists/useGenrePlaylists.jsx";
import { usePlayerTrackObject } from "../../../../../contexts/player-lib-track-object/usePlayerLibTrackObject.jsx";
import { PLAY_STATES, GENRE_TREE_RECT_DIMENSIONS, TRACK_LIST_ORIGIN_TYPE } from "../../../../../constants.js";
import LibTrackUploadingPopupContentObject from "../../../../../models/popup-content-object/LibTrackUploadingPopupContentObject.js";

export default function GenrePlaylistsTree({ genrePlaylistsTree }) {
  const HORIZONTAL_SEPARATOON_BETWEEN_RECTANGLES = 20;
  const VERTICAL_SEPARATOON_BETWEEN_RECTANGLES = 20;
  const HORIZONTAL_SEPARATOON_BETWEEN_NODES =
    GENRE_TREE_RECT_DIMENSIONS.WIDTH + HORIZONTAL_SEPARATOON_BETWEEN_RECTANGLES;
  const VERTICAL_SEPARATOON_BETWEEN_NODES = GENRE_TREE_RECT_DIMENSIONS.HEIGHT + VERTICAL_SEPARATOON_BETWEEN_RECTANGLES;

  const { playState } = usePlayerTrackObject();
  const { showPopup } = usePopup();
  const { handleGenreAddAction } = useGenrePlaylists();
  const { setNewTrackListFromPlaylistUuid, trackListOrigin } = useTrackList();
  const svgRef = useRef(null);
  const fileInputRef = useRef(null);
  const selectingFileGenreUuidRef = useRef(null);

  async function handleFileChange(event) {
    const file = event.target.files[0];
    const popupContentObject = new LibTrackUploadingPopupContentObject(file, selectingFileGenreUuidRef.current);
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
        setNewTrackListFromPlaylistUuid(genrePlaylist.uuid);
      }
    }
  };

  useEffect(() => {
    const root = buildTreeHierarchy();
    const treeData = d3.tree().nodeSize([VERTICAL_SEPARATOON_BETWEEN_NODES, HORIZONTAL_SEPARATOON_BETWEEN_NODES])(root);

    const numberOfLevels = root.height;

    const svgWidth = numberOfLevels * HORIZONTAL_SEPARATOON_BETWEEN_NODES + GENRE_TREE_RECT_DIMENSIONS.WIDTH;
    const lowestNodeX = calculateLowestNodeX(treeData);
    const highestNodeX = calculateHighestNodeX(treeData);

    const xGap = lowestNodeX - highestNodeX;
    const svgHeight = xGap + GENRE_TREE_RECT_DIMENSIONS.HEIGHT;

    const xExtremum = Math.max(Math.abs(lowestNodeX), Math.abs(highestNodeX));
    const xShift = xExtremum - xGap / 2;

    const svg = d3.select(svgRef.current).attr("width", svgWidth).attr("height", svgHeight);

    let nodeY;

    let firstNodeXCorrected = treeData.descendants()[0].x - xShift;

    const linkGenerator = d3
      .linkHorizontal()
      .x((d) => d.y + GENRE_TREE_RECT_DIMENSIONS.WIDTH / 2)
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
        nodeY = GENRE_TREE_RECT_DIMENSIONS.WIDTH / 2 + HORIZONTAL_SEPARATOON_BETWEEN_NODES * d.depth;
        return "translate(" + nodeY + "," + (d.x - firstNodeXCorrected + svgHeight / 2) + ")";
      });

    nodes
      .append("rect")
      .attr("width", GENRE_TREE_RECT_DIMENSIONS.WIDTH)
      .attr("height", GENRE_TREE_RECT_DIMENSIONS.HEIGHT)
      .attr("x", -GENRE_TREE_RECT_DIMENSIONS.WIDTH / 2)
      .attr("y", -GENRE_TREE_RECT_DIMENSIONS.HEIGHT / 2);

    const TRACK_UPLOAD_ICON_OFFSET = 10;
    const GENRE_ADD_ICON_OFFSET = TRACK_UPLOAD_ICON_OFFSET + 17;
    const PLAYLIST_TRACKS_COUNT_TEXT_OFFSET = GENRE_ADD_ICON_OFFSET + 20;
    const PLAY_PAUSE_BUTTON_OFFSET = PLAYLIST_TRACKS_COUNT_TEXT_OFFSET + 13;

    const GENRE_NAME_DIMENSIONS = {
      WIDTH: GENRE_TREE_RECT_DIMENSIONS.WIDTH - 20,
      HEIGHT: GENRE_TREE_RECT_DIMENSIONS.HEIGHT,
    };
    nodes
      .append("foreignObject")
      .attr("class", "tree-node-info-container")
      .attr("width", GENRE_NAME_DIMENSIONS.WIDTH)
      .attr("height", GENRE_NAME_DIMENSIONS.HEIGHT)
      .attr("x", -GENRE_TREE_RECT_DIMENSIONS.WIDTH / 2)
      .attr("y", -GENRE_TREE_RECT_DIMENSIONS.HEIGHT / 2)
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
      .attr("x", GENRE_TREE_RECT_DIMENSIONS.WIDTH / 2 - PLAY_PAUSE_BUTTON_OFFSET)
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
      .attr("x", GENRE_TREE_RECT_DIMENSIONS.WIDTH / 2 - PLAY_PAUSE_BUTTON_OFFSET)
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
      .attr("x", GENRE_TREE_RECT_DIMENSIONS.WIDTH / 2 - PLAYLIST_TRACKS_COUNT_TEXT_OFFSET)
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
      .attr(
        "x",
        GENRE_TREE_RECT_DIMENSIONS.WIDTH / 2 - GENRE_ADD_ICON_OFFSET - GENRE_ADD_PLUS_ICON_DIMENSIONS.WIDTH / 2
      )
      .attr("y", -(GENRE_TREE_RECT_DIMENSIONS.HEIGHT - GENRE_ADD_PLUS_ICON_DIMENSIONS.HEIGHT) / 2)
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
      .attr(
        "x",
        GENRE_TREE_RECT_DIMENSIONS.WIDTH / 2 - TRACK_UPLOAD_ICON_OFFSET - TRACK_UPLOAD_ICON_DIMENSIONS.WIDTH / 2
      )
      .attr("y", -(GENRE_TREE_RECT_DIMENSIONS.HEIGHT - TRACK_UPLOAD_ICON_DIMENSIONS.HEIGHT) / 2)
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

    const iconClassesToShowOnHover = ".genre-add, .track-upload";
    nodes
      .on("mouseover", function () {
        d3.select(this).selectAll(iconClassesToShowOnHover).style("display", "flex");
      })
      .on("mouseout", function () {
        d3.select(this).selectAll(iconClassesToShowOnHover).style("display", "none");
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
