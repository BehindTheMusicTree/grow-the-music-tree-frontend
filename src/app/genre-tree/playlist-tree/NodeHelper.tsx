"use client";

import ReactDOMServer from "react-dom/server";
import { MdMoreVert, MdModeEdit } from "react-icons/md";
import { FaPlus, FaTrashAlt, FaPlay, FaPause, FaSpinner, FaFileUpload } from "react-icons/fa";
import { PiGraphFill } from "react-icons/pi";
import * as d3 from "d3";

import { PlayStates } from "@models/PlayStates";
import { TrackListOriginType } from "@models/track-list/origin/TrackListOriginType";
import { CriteriaPlaylistSimple } from "@domain/playlist/criteria-playlist/simple";
import { CriteriaMinimum } from "@domain/criteria/response/minimum";
import { CriteriaDetailed } from "@schemas/domain/criteria/response/detailed";

import {
  MORE_ICON_WIDTH,
  ACTIONS_CONTAINER_X_OFFSET,
  ACTIONS_CONTAINER_DIMENSIONS_MAX,
  ACTION_CONTAINER_DIMENSIONS,
  ACTION_ICON_SIZE,
  ACTION_ICON_CONTAINER_DIMENSIONS,
  ACTION_LABEL_CONTAINER_DIMENSIONS,
  SPINNER_ICON_SIZE,
  calculateNodeDimensions,
} from "./constants";

type D3Node = d3.HierarchyNode<CriteriaPlaylistSimple>;

interface Callbacks {
  handleMoreActionEnterMouse: (event: MouseEvent, d: D3Node, genrePlaylist: CriteriaPlaylistSimple) => void;
  handlePlayPauseIconAction: (genrePlaylist: CriteriaPlaylistSimple) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  selectingFileGenreUuidRef: React.MutableRefObject<string | null>;
  handleGenreCreationAction: (parent: string) => void;
  setGenreGettingAssignedNewParent: (genre: CriteriaDetailed | null) => void;
  renameGenre: (uuid: string, name: string, showPopup: (title: string, message: string) => void) => Promise<void>;
  showPopup: (title: string, message: string) => void;
  trackListOrigin?: {
    type: TrackListOriginType;
    uuid: string;
  };
  playState: PlayStates;
  updateGenreParent: (genreUuid: string, parentUuid: string) => Promise<void>;
}

/**
 * Builds the hierarchical tree structure from flat data
 */
export function buildTreeHierarchyStructure(
  d3: typeof import("d3"),
  GenrePlaylistTreePerRoot: CriteriaPlaylistSimple[]
) {
  return d3
    .stratify<CriteriaPlaylistSimple>()
    .id((d) => d.uuid)
    .parentId((d) => d.parent?.uuid || null)(GenrePlaylistTreePerRoot);
}

/**
 * Adds the "more" icon container to a node
 */
export function addMoreIconContainer(
  d3: typeof import("d3"),
  genrePlaylist: CriteriaPlaylistSimple,
  group: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>,
  handleMoreActionEnterMouse: (event: MouseEvent, d: D3Node, genrePlaylist: CriteriaPlaylistSimple) => void,
  rootColor: string
) {
  const moreIconContainer = group.select("#more-icon-container-" + genrePlaylist.uuid);
  const dimensions = calculateNodeDimensions(genrePlaylist.uploadedTracksCount);

  if (moreIconContainer.empty()) {
    const moreIconContainer = group.append("g").attr("id", "more-icon-container-" + genrePlaylist.uuid);

    moreIconContainer
      .append("rect")
      .attr("x", dimensions.WIDTH / 2)
      .attr("y", -dimensions.HEIGHT / 2)
      .attr("width", MORE_ICON_WIDTH)
      .attr("height", dimensions.HEIGHT)
      .attr("fill", rootColor);

    moreIconContainer
      .append("foreignObject")
      .attr("x", dimensions.WIDTH / 2)
      .attr("y", -dimensions.HEIGHT / 2)
      .attr("width", MORE_ICON_WIDTH)
      .attr("height", dimensions.HEIGHT)
      .html(function () {
        return ReactDOMServer.renderToString(
          <div className="w-full h-full flex justify-center items-center cursor-pointer hover:bg-gray-500">
            <MdMoreVert size={20} color="white" />
          </div>
        );
      })
      .on("mouseenter", function (this: SVGForeignObjectElement, event: MouseEvent, d: unknown) {
        // When hovering more container: show more + actions
        handleMoreActionEnterMouse(event, d as D3Node, genrePlaylist);
      })
      .on("mouseleave", function (this: SVGForeignObjectElement) {
        // When leaving more container: check if moving to actions or leaving everything
        const actionsContainer = d3.select<SVGGElement, unknown>("#actions-container-" + genrePlaylist.uuid);

        if (actionsContainer.empty()) {
          // No actions container, so we're leaving everything - hide all
          const parent = this.parentNode as Element;
          if (parent) {
            d3.select(parent).remove();
          }
          d3.select<SVGGElement, unknown>("#select-as-new-parent-group-" + genrePlaylist.uuid).remove();
        }
        // If actions container exists, we're moving to it, so keep more visible
      });
  }
}

/**
 * Adds an action container to the actions group
 */
export function addActionContainer(
  d3: typeof import("d3"),
  actionsContainerHeight: number,
  actionsContainerGroup: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>,
  position: number,
  className: string,
  onclick: (event: MouseEvent, d: D3Node) => void,
  iconFunction: (d: D3Node) => React.ReactNode,
  labelFunction: (d: D3Node) => string,
  enabledFunction: (d: D3Node) => boolean = () => true, // new param, default true
  actionsContainerX: number = ACTIONS_CONTAINER_X_OFFSET // new param for dynamic positioning
) {
  const actionContainerGroup = actionsContainerGroup
    .append("g")
    .attr("class", `${className} cursor-pointer`)
    .on("click", function (this: SVGGElement, event: MouseEvent, d: unknown) {
      if (enabledFunction(d as D3Node)) {
        onclick(event, d as D3Node);
      }
    })
    .on("mouseover", function (event: MouseEvent, d: unknown) {
      if (enabledFunction(d as D3Node)) {
        d3.select(this).selectAll("div").classed("bg-gray-500", true);
      }
    })
    .on("mouseout", function () {
      d3.select(this).selectAll("div").classed("bg-gray-500", false);
    });

  actionContainerGroup
    .append("foreignObject")
    .attr("x", actionsContainerX)
    .attr("y", -actionsContainerHeight / 2 + ACTION_CONTAINER_DIMENSIONS.HEIGHT * (position - 1))
    .attr("width", ACTION_ICON_CONTAINER_DIMENSIONS.WIDTH)
    .attr("height", ACTION_ICON_CONTAINER_DIMENSIONS.HEIGHT)
    .html(function (this: SVGForeignObjectElement, d: unknown) {
      const enabled = enabledFunction(d as D3Node);
      return ReactDOMServer.renderToString(
        <div className={`tree-action-icon-container${!enabled ? " opacity-50" : ""}`}>{iconFunction(d as D3Node)}</div>
      );
    });

  actionContainerGroup
    .append("foreignObject")
    .attr("x", actionsContainerX + ACTION_ICON_CONTAINER_DIMENSIONS.WIDTH)
    .attr("y", -actionsContainerHeight / 2 + ACTION_CONTAINER_DIMENSIONS.HEIGHT * (position - 1))
    .attr("width", ACTION_LABEL_CONTAINER_DIMENSIONS.WIDTH)
    .attr("height", ACTION_LABEL_CONTAINER_DIMENSIONS.HEIGHT)
    .html(function (this: SVGForeignObjectElement, d: unknown) {
      const enabled = enabledFunction(d as D3Node);
      return ReactDOMServer.renderToString(
        <div className={`change-parent-label-container tree-action-label-container${!enabled ? " opacity-50" : ""}`}>
          {labelFunction(d as D3Node)}
        </div>
      );
    });

  const datum =
    actionContainerGroup.datum && typeof actionContainerGroup.datum === "function"
      ? actionContainerGroup.datum()
      : undefined;
  if (datum !== undefined && !enabledFunction(datum as D3Node)) {
    actionContainerGroup.classed("cursor-pointer", false).classed("cursor-not-allowed", true);
  }

  return actionContainerGroup;
}

/**
 * Adds the actions group to a node
 */
export function addActionsGroup(
  d3: typeof import("d3"),
  genrePlaylist: CriteriaPlaylistSimple,
  genrePlaylistGroup: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>,
  callbacks: {
    handlePlayPauseIconAction: (genrePlaylist: CriteriaPlaylistSimple) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    selectingFileGenreUuidRef: React.MutableRefObject<string | null>;
    handleGenreCreationAction: (parent: CriteriaMinimum) => void;
    setGenreGettingAssignedNewParent: (genre: CriteriaDetailed | null) => void;
    fetchGenre: (criteriaUuid: string) => Promise<CriteriaDetailed>;
    renameGenre: (uuid: string, name: string, showPopup: (title: string, message: string) => void) => Promise<void>;
    showPopup: (title: string, message: string) => void;
    trackListOrigin: {
      type: TrackListOriginType;
      uuid: string;
    };
    playState: PlayStates;
    handleMoreActionEnterMouse: (event: MouseEvent, d: D3Node, genrePlaylist: CriteriaPlaylistSimple) => void;
  },
  rootColor: string
) {
  const {
    handlePlayPauseIconAction,
    fileInputRef,
    selectingFileGenreUuidRef,
    handleGenreCreationAction,
    setGenreGettingAssignedNewParent,
    fetchGenre,
    renameGenre,
    showPopup,
    trackListOrigin,
    playState,
    handleMoreActionEnterMouse,
  } = callbacks;

  const actionsGroup = genrePlaylistGroup.append("g").attr("id", "actions-container-" + genrePlaylist.uuid);
  const dimensions = calculateNodeDimensions(genrePlaylist.uploadedTracksCount);
  const actionsContainerX = dimensions.WIDTH / 2 + MORE_ICON_WIDTH;

  const isGenreless = !genrePlaylist.criteria;
  const actionsContainerHeight = isGenreless
    ? ACTION_CONTAINER_DIMENSIONS.HEIGHT * 2
    : ACTIONS_CONTAINER_DIMENSIONS_MAX.HEIGHT;
  const actionsContainerY = -actionsContainerHeight / 2;

  actionsGroup
    .append("rect")
    .attr("id", "actions-background")
    .attr("x", actionsContainerX)
    .attr("y", actionsContainerY)
    .attr("width", ACTIONS_CONTAINER_DIMENSIONS_MAX.WIDTH)
    .attr("height", actionsContainerHeight)
    .attr("fill", rootColor);

  actionsGroup
    .append("path")
    .attr("class", "smooth-mouseover-upper-triangle")
    .attr(
      "d",
      "M " +
        dimensions.WIDTH / 2 +
        " -" +
        dimensions.HEIGHT / 2 +
        " L " +
        actionsContainerX +
        " -" +
        actionsContainerHeight / 2 +
        " L " +
        actionsContainerX +
        " -" +
        dimensions.HEIGHT / 2 +
        " Z"
    )
    .attr("fill", "RGBA(0, 0, 0, 0)");

  actionsGroup
    .append("path")
    .attr("class", "smooth-mouseover-lower-triangle")
    .attr(
      "d",
      "M " +
        dimensions.WIDTH / 2 +
        " " +
        dimensions.HEIGHT / 2 +
        " L " +
        actionsContainerX +
        " " +
        actionsContainerHeight / 2 +
        " L " +
        actionsContainerX +
        " " +
        dimensions.HEIGHT / 2 +
        " Z"
    )
    .attr("fill", "RGBA(0, 0, 0, 0)");

  if (!isGenreless) {
    const addChildActionOnclick = async (event: MouseEvent, d: D3Node) => {
      genrePlaylistGroup.dispatch("mouseleave");
      handleGenreCreationAction(d.data.criteria);
    };

    addActionContainer(
      d3,
      actionsContainerHeight,
      actionsGroup,
      5,
      "add-child-container",
      addChildActionOnclick,
      () => <FaPlus className="tree-icon" size={ACTION_ICON_SIZE} color="white" />,
      () => "Add sub-genre",
      () => true,
      actionsContainerX
    );

    const changeParentActionOnclick = async (event: MouseEvent, d: D3Node) => {
      genrePlaylistGroup.dispatch("mouseleave");
      try {
        const detailedCriteria = await fetchGenre(d.data.criteria.uuid);
        setGenreGettingAssignedNewParent(detailedCriteria);
      } catch (error) {
        console.error("Failed to fetch detailed criteria:", error);
      }
    };

    addActionContainer(
      d3,
      actionsContainerHeight,
      actionsGroup,
      6,
      "change-parent-container",
      changeParentActionOnclick,
      () => <PiGraphFill className="tree-icon" size={ACTION_ICON_SIZE} color="white" />, // changed
      () => "Change parent",
      () => true,
      actionsContainerX
    );

    const renameGenreActionOnclick = async (event: MouseEvent, d: D3Node) => {
      genrePlaylistGroup.dispatch("mouseleave");
      const newName = prompt("Enter new genre name:", d.data.name);
      if (newName && newName !== d.data.name) {
        await renameGenre(d.data.criteria.uuid, newName, showPopup);
      }
    };

    addActionContainer(
      d3,
      actionsContainerHeight,
      actionsGroup,
      4,
      "rename-container",
      renameGenreActionOnclick,
      () => <MdModeEdit className="tree-icon" size={ACTION_ICON_SIZE} color="white" />, // changed
      () => "Rename",
      () => true,
      actionsContainerX
    );

    const deleteGenreActionOnclick = (_event: MouseEvent, _d: D3Node) => {
      genrePlaylistGroup.dispatch("mouseleave");
      if (confirm("Are you sure you want to delete this genre?")) {
        // TODO: Implement delete genre
      }
    };

    addActionContainer(
      d3,
      actionsContainerHeight,
      actionsGroup,
      7,
      "delete-container",
      deleteGenreActionOnclick,
      () => <FaTrashAlt className="tree-icon" size={ACTION_ICON_SIZE} color="white" />, // changed
      () => "Delete",
      () => true,
      actionsContainerX
    );
  }

  const playPauseActionOnclick = (event: MouseEvent, d: D3Node) => {
    handlePlayPauseIconAction(d.data);
  };

  addActionContainer(
    d3,
    actionsContainerHeight,
    actionsGroup,
    1,
    "track-count-container",
    () => {}, // no-op for non-clickable
    () => (
      <span
        className="tree-icon flex items-center justify-center text-white text-lg font-bold"
        style={{ width: ACTION_ICON_SIZE, height: ACTION_ICON_SIZE }}
      >
        #
      </span>
    ),
    (d) => `${d.data.uploadedTracksCount ?? 0} tracks`,
    () => true,
    actionsContainerX
  );

  addActionContainer(
    d3,
    actionsContainerHeight,
    actionsGroup,
    2,
    "play-pause-container",
    playPauseActionOnclick,
    (d) => {
      if (
        trackListOrigin &&
        trackListOrigin.type === TrackListOriginType.PLAYLIST &&
        trackListOrigin.uuid === d.data.uuid
      ) {
        if (playState === PlayStates.PLAYING) {
          return <FaPause className="tree-icon" size={ACTION_ICON_SIZE} color="white" />;
        } else if (playState === PlayStates.LOADING) {
          return <FaSpinner className="tree-icon animate-spin" size={SPINNER_ICON_SIZE} color="white" />;
        }
      }
      return <FaPlay className="tree-icon" size={ACTION_ICON_SIZE} color="white" />;
    },
    (d) => {
      if (
        trackListOrigin &&
        trackListOrigin.type === TrackListOriginType.PLAYLIST &&
        trackListOrigin.uuid === d.data.uuid
      ) {
        return playState === PlayStates.PLAYING ? "Pause" : playState === PlayStates.LOADING ? "Loading" : "Play";
      }
      return "Play";
    },
    (d) => d.data.uploadedTracksCount > 0,
    actionsContainerX
  );

  const uploadTrackActionOnclick = (event: MouseEvent, d: D3Node) => {
    event.stopPropagation();
    selectingFileGenreUuidRef.current = d.data.criteria?.uuid;
    fileInputRef.current?.click();
    genrePlaylistGroup.dispatch("mouseleave");
  };

  addActionContainer(
    d3,
    actionsContainerHeight,
    actionsGroup,
    3,
    "upload-track-container",
    uploadTrackActionOnclick,
    () => <FaFileUpload className="tree-icon" size={ACTION_ICON_SIZE} color="white" />,
    () => "Upload track",
    () => true,
    actionsContainerX
  );

  actionsGroup.on("mouseenter", function () {
    // When hovering actions container: show more + actions (all)
    addMoreIconContainer(d3, genrePlaylist, genrePlaylistGroup, handleMoreActionEnterMouse, rootColor);
  });

  actionsGroup.on("mouseleave", function () {
    // When leaving actions container: always hide both containers
    // This ensures we don't get into a cycle of recreating containers

    // Hide both containers
    d3.select<SVGGElement, unknown>("#actions-container-" + genrePlaylist.uuid).remove();
    d3.select<SVGGElement, unknown>("#more-icon-container-" + genrePlaylist.uuid).remove();

    // Hide everything
    d3.select<SVGGElement, unknown>("#select-as-new-parent-group-" + genrePlaylist.uuid).remove();
  });

  return actionsGroup;
}

/**
 * Adds the parent selection overlay to a node
 */
export function addParentSelectionOverlay(
  d3: typeof import("d3"),
  parentNode: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>,
  callbacks: Pick<Callbacks, "updateGenreParent" | "setGenreGettingAssignedNewParent"> & {
    genreGettingAssignedNewParent: CriteriaDetailed | null;
  }
) {
  const { updateGenreParent, genreGettingAssignedNewParent, setGenreGettingAssignedNewParent } = callbacks;

  const nodeUuid = (parentNode.datum() as D3Node).data.uuid;
  const nodeData = (parentNode.datum() as D3Node).data;
  const dimensions = calculateNodeDimensions(nodeData.uploadedTracksCount);

  let selectAsNewParentGroup = parentNode.select<SVGGElement>("#select-as-new-parent-group-" + nodeUuid);
  if (selectAsNewParentGroup.empty()) {
    selectAsNewParentGroup = parentNode
      .append("g")
      .attr("id", "select-as-new-parent-group-" + nodeUuid)
      .attr("class", "select-as-new-parent-group cursor-pointer")
      .on("mouseleave", function () {
        d3.select(this).remove();
      });

    selectAsNewParentGroup
      .append("rect")
      .attr("class", "select-as-new-parent-layer")
      .attr("width", dimensions.WIDTH)
      .attr("height", dimensions.HEIGHT)
      .attr("x", -dimensions.WIDTH / 2)
      .attr("y", -dimensions.HEIGHT / 2)
      .attr("fill", "green");

    selectAsNewParentGroup
      .append("foreignObject")
      .attr("class", "select-as-new-parent-icon-foreign-obj")
      .attr("width", dimensions.WIDTH)
      .attr("height", dimensions.HEIGHT)
      .attr("x", -dimensions.WIDTH / 2)
      .attr("y", -dimensions.HEIGHT / 2)
      .attr("fill", "grey")
      .html(function () {
        return ReactDOMServer.renderToString(
          <div className="select-as-new-parent-layer-icon-container h-full w-full flex items-center justify-center">
            <PiGraphFill size={20} color="white" />
            <div className="select-as-new-parent-layer-icon-label text-white text-xs ml-2">Select as new parent</div>
          </div>
        );
      })
      .on("click", function (this: SVGForeignObjectElement, event: MouseEvent, d: unknown) {
        if (genreGettingAssignedNewParent) {
          updateGenreParent(genreGettingAssignedNewParent.uuid, (d as D3Node).data.criteria.uuid);
          setGenreGettingAssignedNewParent(null);
        }
      });
  }

  return selectAsNewParentGroup;
}
