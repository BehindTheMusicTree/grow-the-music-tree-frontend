import { makeUploadedQueryKeys, makeUploadedEndpoints } from "./library/uploaded";
import { makeSpotifyQueryKeys, makeSpotifyEndpoints } from "./library/spotify";

export const libraryQueryKeys = {
  me: {
    uploaded: makeUploadedQueryKeys("me"),
    spotify: makeSpotifyQueryKeys("me"),
  },
  reference: {
    uploaded: makeUploadedQueryKeys("reference"),
    spotify: makeSpotifyQueryKeys("reference"),
  },
};

export const libraryEndpoints = {
  me: {
    uploaded: makeUploadedEndpoints("me"),
    spotify: makeSpotifyEndpoints("me"),
  },
  reference: {
    uploaded: makeUploadedEndpoints("reference"),
    spotify: makeSpotifyEndpoints("reference"),
  },
};
