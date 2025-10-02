import { PRIMARY_COLOR } from "@utils/theme";

export const RECTANGLE_COLOR = PRIMARY_COLOR;

interface Dimensions {
  WIDTH: number;
  HEIGHT: number;
}

export const RECT_BASE_DIMENSIONS: Dimensions = {
  WIDTH: 180,
  HEIGHT: 30,
};

// Dynamic sizing configuration
export const MIN_NODE_WIDTH = 180;
export const MAX_NODE_WIDTH = 350;
export const MIN_NODE_HEIGHT = 35;
export const MAX_NODE_HEIGHT = 60;
export const TRACK_COUNT_SCALING_FACTOR = 0.8; // How much width increases per track

export const ACTION_ICON_SIZE = 14;

export const ACTION_ICON_CONTAINER_DIMENSIONS: Dimensions = {
  WIDTH: ACTION_ICON_SIZE + 10,
  HEIGHT: RECT_BASE_DIMENSIONS.HEIGHT,
};

export const ACTION_LABEL_CONTAINER_DIMENSIONS: Dimensions = {
  WIDTH: 82,
  HEIGHT: RECT_BASE_DIMENSIONS.HEIGHT,
};

export const ACTION_CONTAINER_DIMENSIONS: Dimensions = {
  WIDTH: ACTION_ICON_CONTAINER_DIMENSIONS.WIDTH + ACTION_LABEL_CONTAINER_DIMENSIONS.WIDTH,
  HEIGHT: RECT_BASE_DIMENSIONS.HEIGHT,
};

export const MORE_ICON_WIDTH = 22;
export const ACTIONS_CONTAINER_X_OFFSET = RECT_BASE_DIMENSIONS.WIDTH / 2 + MORE_ICON_WIDTH;

export const ACTIONS_CONTAINER_DIMENSIONS_MAX: Dimensions = {
  WIDTH: ACTION_CONTAINER_DIMENSIONS.WIDTH,
  HEIGHT: ACTION_CONTAINER_DIMENSIONS.HEIGHT * 7,
};

export const NODE_DIMENSIONS: Dimensions = {
  WIDTH: RECT_BASE_DIMENSIONS.WIDTH + MORE_ICON_WIDTH + ACTIONS_CONTAINER_DIMENSIONS_MAX.WIDTH,
  HEIGHT: RECT_BASE_DIMENSIONS.HEIGHT,
};

export const HORIZONTAL_SEPARATOON_BETWEEN_RECTANGLES = 5;
export const VERTICAL_SEPARATOON_BETWEEN_RECTANGLES = 20;
export const HORIZONTAL_SEPARATOON_BETWEEN_NODES = NODE_DIMENSIONS.WIDTH + HORIZONTAL_SEPARATOON_BETWEEN_RECTANGLES;
export const VERTICAL_SEPARATOON_BETWEEN_NODES = NODE_DIMENSIONS.HEIGHT + VERTICAL_SEPARATOON_BETWEEN_RECTANGLES;
export const SPINNER_ICON_SIZE = 14;

// Utility functions for dynamic node sizing
export function calculateNodeDimensions(trackCount: number): Dimensions {
  // Calculate width based on track count with logarithmic scaling for better visual distribution
  const logTrackCount = Math.log(Math.max(1, trackCount));
  const widthScale = Math.min(logTrackCount * TRACK_COUNT_SCALING_FACTOR, MAX_NODE_WIDTH - MIN_NODE_WIDTH);
  const width = Math.max(MIN_NODE_WIDTH, MIN_NODE_WIDTH + widthScale);

  // Calculate height with a more subtle increase
  const heightScale = Math.min(trackCount * 0.5, MAX_NODE_HEIGHT - MIN_NODE_HEIGHT);
  const height = Math.max(MIN_NODE_HEIGHT, MIN_NODE_HEIGHT + heightScale);

  return {
    WIDTH: Math.round(width),
    HEIGHT: Math.round(height),
  };
}

export function getMaxNodeDimensions(nodes: Array<{ uploadedTracksCount: number }>): Dimensions {
  const maxTracks = Math.max(...nodes.map((node) => node.uploadedTracksCount), 0);
  return calculateNodeDimensions(maxTracks);
}
