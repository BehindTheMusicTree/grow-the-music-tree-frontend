import { makeSpotifyQueryKeys, makeSpotifyEndpoints } from "./spotify";

export const libraryQueryKeys = {
  me: {
    spotify: makeSpotifyQueryKeys("me"),
  },
};

export const libraryEndpoints = {
  me: {
    spotify: makeSpotifyEndpoints("me"),
  },
};
