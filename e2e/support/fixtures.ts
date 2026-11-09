import {
  ArtistDetailedSchema,
  ArtistGenreCountSchema,
  CriteriaOverviewSchema,
  ReferenceGenreDetailedSchema,
  ReferenceGenrePlaylistSchema,
  RegionGenreLexiconSchema,
  SongDetailedSchema,
} from "@behindthemusictree/app-kit/genre-tree";
import { RegionMapIndexSchema } from "../../src/schemas/api/region-map";

/**
 * Frozen API world for the browser journeys. Each payload is parsed with the schema the app parses it with, so a
 * fixture that drifts from the contract fails here instead of surfacing as a confusing panel error.
 */

const NOW = "2026-01-01T00:00:00.000Z";
const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

export const ids = {
  rock: uuid(1),
  punk: uuid(2),
  jazz: uuid(3),
  pop: uuid(4),
  rockPlaylist: uuid(11),
  punkPlaylist: uuid(12),
  jazzPlaylist: uuid(13),
  popPlaylist: uuid(14),
  artist: uuid(21),
  song: uuid(31),
  tileset: "a".repeat(64),
} as const;

/** Punk is placed in France (via its Wikidata id); Jazz has no region. */
export const names = {
  rock: "Rock",
  punk: "Punk",
  jazz: "Jazz",
  pop: "Mainstream Pop",
  artist: "The Fixtures",
  song: "Frozen Song",
  songTab: "Frozen Song — The Fixtures",
  region: "France",
} as const;

export type GenreKey = "rock" | "punk" | "jazz" | "pop";

const wikidata = { rock: "Q11399", punk: "Q3071", jazz: "Q8341", pop: "Q37073" } as const;

const criteria = (key: GenreKey) => ({ uuid: ids[key], name: names[key], wikidataId: wikidata[key] });
const playlistRef = (key: GenreKey) => ({ uuid: ids[`${key}Playlist`], name: names[key] });
const counts = { genreOnlyTracksCount: 1, genreAndSubgenresTracksCount: { all: 1 } };
const catalogue = counts;

const treePlaylist = (key: GenreKey, parent: "rock" | null, root: "rock" | "jazz" | "pop") => ({
  ...playlistRef(key),
  criteria: criteria(key),
  parent: parent ? playlistRef(parent) : null,
  root: playlistRef(root),
  tracksCount: 1,
  ...counts,
  catalogue,
  createdOn: NOW,
  updatedOn: NOW,
  isUnacceptedRoot: false,
});

const genreDetail = (key: GenreKey, parent: "rock" | null, root: "rock" | "jazz" | "pop") => ({
  ...criteria(key),
  summary: `${names[key]} summary.`,
  parent: parent ? criteria(parent) : null,
  ascendants: parent ? [{ ascendant: criteria(parent), degree: 1 }] : [],
  root: criteria(root),
  children: key === "rock" ? [criteria("punk")] : [],
  catalogue,
  criteriaPlaylist: { ...playlistRef(key), ...counts },
  essentialSongs: [],
  tracksCount: 1,
  updatedOn: NOW,
});

const artistRef = { uuid: ids.artist, name: names.artist };

export const genreDetails = {
  [ids.rock]: ReferenceGenreDetailedSchema.parse(genreDetail("rock", null, "rock")),
  [ids.punk]: ReferenceGenreDetailedSchema.parse(genreDetail("punk", "rock", "rock")),
  [ids.jazz]: ReferenceGenreDetailedSchema.parse(genreDetail("jazz", null, "jazz")),
  [ids.pop]: ReferenceGenreDetailedSchema.parse(genreDetail("pop", null, "pop")),
};

export const tree = ReferenceGenrePlaylistSchema.array().parse([
  treePlaylist("rock", null, "rock"),
  treePlaylist("punk", "rock", "rock"),
  treePlaylist("jazz", null, "jazz"),
  treePlaylist("pop", null, "pop"),
]);

export const artist = ArtistDetailedSchema.parse({
  ...artistRef,
  musicbrainzArtistId: null,
  type: "group",
  country: "FR",
  beginYear: 1990,
  endYear: null,
  ended: false,
  links: [],
  members: [],
  memberOf: [],
  albums: [],
  tracksCount: 1,
  image: null,
});

export const artistGenreCounts = ArtistGenreCountSchema.array().parse([
  { ...counts, catalogue, genrePlaylist: ids.punkPlaylist, songsCount: 1, tracksCount: 1 },
]);

export const song = SongDetailedSchema.parse({
  uuid: ids.song,
  title: names.song,
  artists: [artistRef],
  genre: criteria("punk"),
  playCount: 0,
  createdOn: NOW,
  youtubeVideo: { id: "dQw4w9WgXcQ", unplayableReason: null },
  musicbrainzRecordingId: null,
});

export const lexicon = RegionGenreLexiconSchema.parse([
  {
    wikidataId: wikidata.punk,
    uuid: ids.punk,
    name: names.punk,
    treeName: "canonical",
    genrePlaylistUuid: ids.punkPlaylist,
    isUmbrella: false,
    viewsCount: 1,
  },
]);

const france = {
  id: "FR",
  name: names.region,
  kind: "country",
  parentId: "world",
  childIds: [],
  zoneIds: [],
  bbox: [-5, 42, 8, 51],
  mainBbox: [-5, 42, 8, 51],
  centroid: [2, 46],
  drillable: false,
  overviewItemId: null,
  inheritedOverviewItemId: null,
  genres: [{ itemId: wikidata.punk, rule: "origin", relation: "canonical" }],
  songCount: 1,
  genreCount: 1,
};

export const regionIndex = RegionMapIndexSchema.parse({
  regions: [france],
  tileset: ids.tileset,
  worldChildIds: ["FR"],
  worldZoneIds: [],
});

export const genreOverview = (key: GenreKey) =>
  CriteriaOverviewSchema.parse({
    uuid: ids[key],
    name: names[key],
    summary: `${names[key]} summary.`,
    description: null,
    summarySourceUrl: null,
  });

export const artistSongsPage = {
  overallTotal: 1,
  next: null,
  previous: null,
  results: [song],
  page: 1,
  pageSize: 20,
  totalPages: 1,
};
