import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import ReactDOMServer from "react-dom/server";

import * as d3 from "d3";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaSpinner, FaFileUpload, FaPlus } from "react-icons/fa";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";

import { usePopup } from "../../../../contexts/usePopup.jsx";
import { PLAY_STATES, GENRE_TREE_RECT_DIMENSIONS } from "../../../../constants";
import { BadRequestError } from "../../../../utils/errors/BadRequestError";
import BadRequestPopupContentObject from "../../../../models/popup-content-object/BadRequestPopupContentObject.js";

export default function GenreTree({
  genres,
  handleGenreAddClick,
  selectPlaylistUuidToPlay,
  playState,
  playingPlaylistUuidWithLoadingState,
  postLibTracksAndRefresh,
}) {
  const HORIZONTAL_SEPARATOON_BETWEEN_RECTANGLES = 20;
  const VERTICAL_SEPARATOON_BETWEEN_RECTANGLES = 20;
  const HORIZONTAL_SEPARATOON_BETWEEN_NODES =
    GENRE_TREE_RECT_DIMENSIONS.WIDTH + HORIZONTAL_SEPARATOON_BETWEEN_RECTANGLES;
  const VERTICAL_SEPARATOON_BETWEEN_NODES = GENRE_TREE_RECT_DIMENSIONS.HEIGHT + VERTICAL_SEPARATOON_BETWEEN_RECTANGLES;

  const { showPopup } = usePopup();
  const svgRef = useRef(null);
  const fileInputRef = useRef(null);
  const selectingFileGenreUuidRef = useRef(null);

  async function handleFileChange(event) {
    const file = event.target.files[0];
    try {
      await postLibTracksAndRefresh(file, selectingFileGenreUuidRef.current);
    } catch (error) {
      if (error instanceof BadRequestError) {
        const messages = error.message;
        const popupContentObject = new BadRequestPopupContentObject("uploading track", messages);
        showPopup(popupContentObject);
      }
    }
  }

  const buildTreeHierarchy = () => {
    return d3
      .stratify()
      .id((d) => d.uuid)
      .parentId((d) => d.parent?.uuid || null)(genres);
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
      .attr("class", "w-3.5 h-3.5 flex justify-center items-center")
      .attr("width", SPINNER_ICON_SIZE)
      .attr("height", SPINNER_ICON_SIZE)
      .attr("dominant-baseline", "middle")
      .attr("x", GENRE_TREE_RECT_DIMENSIONS.WIDTH / 2 - PLAY_PAUSE_BUTTON_OFFSET - SPINNER_ICON_SIZE / 2)
      .attr("y", -GENRE_TREE_RECT_DIMENSIONS.HEIGHT / 2 + SPINNER_ICON_SIZE / 2)
      .html(function (d) {
        if (
          playingPlaylistUuidWithLoadingState &&
          playingPlaylistUuidWithLoadingState.uuid === d.data.criteriaPlaylist.uuid &&
          playingPlaylistUuidWithLoadingState.isLoading
        ) {
          return ReactDOMServer.renderToString(
            <FaSpinner size={SPINNER_ICON_SIZE} className="animate-spin fill-current text-white" />
          );
        }
      });

    const PLAY_PAUSE_ICON_DIMENSIONS = {
      WIDTH: 14,
      HEIGHT: 16,
    };
    nodes
      .append("foreignObject")
      .attr("class", "playpause tree-node-icon-container")
      .attr("width", PLAY_PAUSE_ICON_DIMENSIONS.WIDTH)
      .attr("height", PLAY_PAUSE_ICON_DIMENSIONS.HEIGHT)
      .attr("x", GENRE_TREE_RECT_DIMENSIONS.WIDTH / 2 - PLAY_PAUSE_BUTTON_OFFSET)
      .attr("y", -GENRE_TREE_RECT_DIMENSIONS.HEIGHT / 2 + PLAY_PAUSE_ICON_DIMENSIONS.HEIGHT / 2)
      .style("visibility", function (d) {
        playingPlaylistUuidWithLoadingState &&
        playingPlaylistUuidWithLoadingState.uuid === d.data.criteriaPlaylist.uuid &&
        playingPlaylistUuidWithLoadingState.isLoading
          ? "hidden"
          : "visible";
      })
      .html(function (d) {
        if (d.data.criteriaPlaylist.libraryTracksCount === 0) {
          return "";
        }

        if (
          playingPlaylistUuidWithLoadingState &&
          playingPlaylistUuidWithLoadingState.uuid === d.data.criteriaPlaylist.uuid
        ) {
          if (playingPlaylistUuidWithLoadingState.isLoading) {
            return "";
          }
          return playState === PLAY_STATES.PLAYING
            ? ReactDOMServer.renderToString(<FontAwesomeIcon size="1x" icon={faPlay} className="play tree-node-icon" />)
            : ReactDOMServer.renderToString(
                <FontAwesomeIcon size="1x" icon={faPause} className="pause tree-node-icon" />
              );
        }
        return ReactDOMServer.renderToString(
          <FontAwesomeIcon size="1x" icon={faPlay} className="play tree-node-icon" />
        );
      })
      .on("click", function (event, d) {
        if (
          !playingPlaylistUuidWithLoadingState ||
          playState === PLAY_STATES.STOPPED ||
          playingPlaylistUuidWithLoadingState.uuid !== d.data.criteriaPlaylist.uuid
        ) {
          if (d.data.criteriaPlaylist.libraryTracksCount > 0) {
            event.stopPropagation();
            selectPlaylistUuidToPlay(d.data.criteriaPlaylist.uuid);
          }
        }
      })
      .style("cursor", function (d) {
        if (d.data.criteriaPlaylist.libraryTracksCount > 0) {
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
      .attr("y", -GENRE_TREE_RECT_DIMENSIONS.HEIGHT / 2 + PLAYLIST_TRACKS_COUNT_TEXT_DIMENSIONS.HEIGHT / 2)
      .html(function (d) {
        return `<div class="tree-node-info">` + d.data.criteriaPlaylist.libraryTracksCount + "</div>";
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
        handleGenreAddClick(event, d.data.uuid);
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
        selectingFileGenreUuidRef.current = d.data.uuid;
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
  }, [genres, playState, playingPlaylistUuidWithLoadingState]);

  return (
    <div>
      <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
      <svg ref={svgRef} width="600" height="400" className="mt-5"></svg>
    </div>
  );
}

GenreTree.propTypes = {
  genres: PropTypes.array.isRequired,
  handleGenreAddClick: PropTypes.func.isRequired,
  selectPlaylistUuidToPlay: PropTypes.func.isRequired,
  playState: PropTypes.string.isRequired,
  playingPlaylistUuidWithLoadingState: PropTypes.object,
  postLibTracksAndRefresh: PropTypes.func.isRequired,
};
