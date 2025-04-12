import ReactDOMServer from "react-dom/server";
import { MdMoreVert, MdModeEdit } from "react-icons/md";
import { FaPlus, FaTrashAlt, FaPlay, FaPause, FaSpinner, FaFileUpload } from "react-icons/fa";
import { PiGraphFill } from "react-icons/pi";

import { PLAY_STATES, TRACK_LIST_ORIGIN_TYPE } from "@utils/constants";
import {
  RECTANGLE_COLOR,
  RECT_BASE_DIMENSIONS,
  MORE_ICON_WIDTH,
  ACTIONS_CONTAINER_X_OFFSET,
  ACTIONS_CONTAINER_DIMENSIONS_MAX,
  ACTION_CONTAINER_DIMENSIONS,
  ACTION_ICON_SIZE,
  ACTION_ICON_CONTAINER_DIMENSIONS,
  ACTION_LABEL_CONTAINER_DIMENSIONS,
  SPINNER_ICON_SIZE,
} from "./tree-constants";

/**
 * Builds the hierarchical tree structure from flat data
 */
export function buildTreeHierarchy(d3, genrePlaylistsTree) {
  return d3
    .stratify()
    .id((d) => d.uuid)
    .parentId((d) => d.parent?.uuid || null)(genrePlaylistsTree);
}

/**
 * Adds the "more" icon container to a node
 */
export function addMoreIconContainer(d3, genrePlaylist, group, callbacks) {
  const { handleMoreActionEnterMouse } = callbacks;
  let moreIconContainer = group.select("#more-icon-container-" + genrePlaylist.uuid);

  if (moreIconContainer.empty()) {
    const moreIconContainer = group.append("g").attr("id", "more-icon-container-" + genrePlaylist.uuid);

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
      .on("mouseenter", (event, d) => handleMoreActionEnterMouse(event, d, genrePlaylist))
      .on("mouseleave", function () {
        d3.select(this.parentNode).remove();
      });
  }
}

/**
 * Adds an action container to the actions group
 */
export function addActionContainer(
  d3,
  actionsContainerHeight,
  actionsContainerGroup,
  position,
  className,
  onclick,
  iconDiv,
  labelFunction,
  iconContainerVisibilityFunction = () => "visible"
) {
  const actionContainerGroup = actionsContainerGroup
    .append("g")
    .attr("class", `${className} cursor-pointer`)
    .on("click", function (event, d) {
      onclick(event, d);
    })
    .on("mouseover", function () {
      d3.select(this).selectAll("div").classed("bg-gray-500", true);
    })
    .on("mouseout", function () {
      d3.select(this).selectAll("div").classed("bg-gray-500", false);
    });

  actionContainerGroup
    .append("foreignObject")
    .attr("x", ACTIONS_CONTAINER_X_OFFSET)
    .attr("y", -actionsContainerHeight / 2 + ACTION_CONTAINER_DIMENSIONS.HEIGHT * (position - 1))
    .attr("width", ACTION_ICON_CONTAINER_DIMENSIONS.WIDTH)
    .attr("height", ACTION_ICON_CONTAINER_DIMENSIONS.HEIGHT)
    .style("visibility", iconContainerVisibilityFunction)
    .html(function () {
      return ReactDOMServer.renderToString(<div className="tree-action-icon-container">{iconDiv}</div>);
    });

  actionContainerGroup
    .append("foreignObject")
    .attr("x", ACTIONS_CONTAINER_X_OFFSET + ACTION_ICON_CONTAINER_DIMENSIONS.WIDTH)
    .attr("y", -actionsContainerHeight / 2 + ACTION_CONTAINER_DIMENSIONS.HEIGHT * (position - 1))
    .attr("width", ACTION_LABEL_CONTAINER_DIMENSIONS.WIDTH)
    .attr("height", ACTION_LABEL_CONTAINER_DIMENSIONS.HEIGHT)
    .html(function (d) {
      return ReactDOMServer.renderToString(
        <div className="change-parent-label-container tree-action-label-container">{labelFunction(d)}</div>
      );
    });

  return actionContainerGroup;
}

/**
 * Adds the actions group to a node
 */
export function addActionsGroup(d3, genrePlaylist, genrePlaylistGroup, callbacks) {
  const {
    handlePlayPauseIconAction,
    fileInputRef,
    selectingFileGenreUuidRef,
    addGenre,
    setGenreGettingAssignedNewParent,
    renameGenre,
    showPopup,
    trackListOrigin,
    playState,
  } = callbacks;

  const actionsGroup = genrePlaylistGroup.append("g").attr("id", "actions-container-" + genrePlaylist.uuid);

  const isGenreless = !genrePlaylist.criteria;
  // Adjust container height based on whether it's genreless and how many actions are shown
  // For genreless, we only show 2 actions (play/pause and upload track)
  // For regular genres, we show 6 actions (play/pause, upload track, add sub-genre, change parent, rename, delete)
  const actionsContainerHeight = isGenreless
    ? ACTION_CONTAINER_DIMENSIONS.HEIGHT * 2 // Only 2 actions for genreless
    : ACTIONS_CONTAINER_DIMENSIONS_MAX.HEIGHT;
  const actionsContainerY = -actionsContainerHeight / 2;

  actionsGroup
    .append("rect")
    .attr("id", "actions-background")
    .attr("x", ACTIONS_CONTAINER_X_OFFSET)
    .attr("y", actionsContainerY)
    .attr("width", ACTIONS_CONTAINER_DIMENSIONS_MAX.WIDTH)
    .attr("height", actionsContainerHeight)
    .attr("fill", RECTANGLE_COLOR);

  actionsGroup
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
        actionsContainerHeight / 2 +
        " L " +
        ACTIONS_CONTAINER_X_OFFSET +
        " -" +
        RECT_BASE_DIMENSIONS.HEIGHT / 2 +
        " Z"
    )
    .attr("fill", "RGBA(0, 0, 0, 0)");

  actionsGroup
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
        actionsContainerHeight / 2 +
        " L " +
        ACTIONS_CONTAINER_X_OFFSET +
        " " +
        RECT_BASE_DIMENSIONS.HEIGHT / 2 +
        " Z"
    )
    .attr("fill", "RGBA(0, 0, 0, 0)");

  if (!isGenreless) {
    const addChildActionOnclick = async (event, d) => {
      genrePlaylistGroup.dispatch("mouseleave");
      const name = prompt("New genre name:");
      if (name) {
        const result = await addGenre(name, d.data.criteria.uuid);
        if (!result.success) {
          showPopup("Error", result.error.message);
        }
      }
    };

    addActionContainer(
      d3,
      actionsContainerHeight,
      actionsGroup,
      3,
      "add-child-container",
      addChildActionOnclick,
      <FaPlus className="tree-icon" size={ACTION_ICON_SIZE} color="white" />,
      () => "Add sub-genre"
    );

    const changeParentActionOnclick = (event, d) => {
      genrePlaylistGroup.dispatch("mouseleave");
      setGenreGettingAssignedNewParent(d.data.criteria);
    };

    addActionContainer(
      d3,
      actionsContainerHeight,
      actionsGroup,
      4,
      "change-parent-container",
      changeParentActionOnclick,
      <PiGraphFill className="tree-icon" size={ACTION_ICON_SIZE} color="white" />,
      () => "Change parent"
    );

    const renameGenreActionOnclick = async (event, d) => {
      genrePlaylistGroup.dispatch("mouseleave");
      const newName = prompt("Enter new genre name:", d.data.name);
      if (newName && newName !== d.data.name) {
        // Pass showPopup as callback for error handling
        await renameGenre(d.data.criteria.uuid, newName, showPopup);
      }
    };

    addActionContainer(
      d3,
      actionsContainerHeight,
      actionsGroup,
      5,
      "rename-genre-container",
      renameGenreActionOnclick,
      <MdModeEdit className="tree-icon" size={ACTION_ICON_SIZE} color="white" />,
      () => "Rename genre"
    );

    const deleteGenreActionOnclick = (event, d) => {
      genrePlaylistGroup.dispatch("mouseleave");
      const popupContentObject = new callbacks.GenreDeletionPopupContentObject(d.data.criteria);
      showPopup(popupContentObject);
    };

    addActionContainer(
      d3,
      actionsContainerHeight,
      actionsGroup,
      6,
      "delete-genre-container",
      deleteGenreActionOnclick,
      <FaTrashAlt className="tree-icon" size={ACTION_ICON_SIZE} color="white" />,
      () => "Delete genre"
    );
  }

  const playPauseActionOnclick = (event, d) => {
    event.stopPropagation();
    handlePlayPauseIconAction(d.data);
  };

  const spinnerVisibilityFunction = (d) =>
    trackListOrigin &&
    trackListOrigin.type === TRACK_LIST_ORIGIN_TYPE.PLAYLIST &&
    trackListOrigin.object.uuid === d.data.uuid &&
    playState === PLAY_STATES.LOADING
      ? "visible"
      : "hidden";

  const playPauseContainerGroup = addActionContainer(
    d3,
    actionsContainerHeight,
    actionsGroup,
    1,
    "playpause-container",
    playPauseActionOnclick,
    <FaSpinner size={SPINNER_ICON_SIZE} className="animate-spin fill-current text-white" />,
    (d) => d.data.uploadedTracksCount + " track" + (d.data.uploadedTracksCount > 1 ? "s" : ""),
    spinnerVisibilityFunction
  );

  const PLAY_PAUSE_ICON_DIMENSIONS = {
    WIDTH: 12,
    HEIGHT: 12,
  };
  playPauseContainerGroup
    .append("foreignObject")
    .attr("x", ACTIONS_CONTAINER_X_OFFSET)
    .attr("y", actionsContainerY)
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
            d.data.uploadedTracksCount === 0 ? "text-gray-500" : ""
          }`}
        >
          <FaPlay
            size={PLAY_PAUSE_ICON_DIMENSIONS.HEIGHT}
            className="play-icon"
            color={`${d.data.uploadedTracksCount === 0 ? "grey" : "white"}`}
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
      if (d.data.uploadedTracksCount > 0) {
        return "pointer";
      }
      return "default";
    });

  const uploadTrackActionOnclick = (event, d) => {
    event.stopPropagation();
    selectingFileGenreUuidRef.current = d.data.criteria?.uuid;
    fileInputRef.current.click();
    genrePlaylistGroup.dispatch("mouseleave");
  };

  addActionContainer(
    d3,
    actionsContainerHeight,
    actionsGroup,
    2,
    "upload-track-container",
    uploadTrackActionOnclick,
    <FaFileUpload className="tree-icon" size={ACTION_ICON_SIZE} color="white" />,
    () => "Upload track"
  );

  actionsGroup.on("mouseenter", function () {
    addMoreIconContainer(d3, genrePlaylist, genrePlaylistGroup, callbacks);
  });

  return actionsGroup;
}

/**
 * Adds the parent selection overlay to a node
 */
export function addParentSelectionOverlay(d3, parentNode, callbacks) {
  const { updateGenreParent, genreUuidGettingAssignedNewParent, setGenreGettingAssignedNewParent } = callbacks;

  let selectAsNewParentGroup = parentNode.select("#select-as-new-parent-group");
  if (selectAsNewParentGroup.empty()) {
    selectAsNewParentGroup = parentNode
      .append("g")
      .attr("class", "select-as-new-parent-group cursor-pointer")
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
            <div className="select-as-new-parent-layer-icon-label text-white text-xs ml-2">Select as new parent</div>
          </div>
        );
      })
      .on("click", function (event, d) {
        updateGenreParent(genreUuidGettingAssignedNewParent, d.data.criteria.uuid);
        setGenreGettingAssignedNewParent(null);
      });
  }

  return selectAsNewParentGroup;
}
