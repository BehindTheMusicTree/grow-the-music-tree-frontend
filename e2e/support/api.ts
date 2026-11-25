import type { Page } from "@playwright/test";
import {
  artist,
  artistGenreCounts,
  artistSongsPage,
  genreDetails,
  genreOverview,
  ids,
  lexicon,
  regionIndex,
  song,
  tree,
} from "./fixtures";

/** The API client calls trailing-slash URLs (308 to no-slash) and appends query strings, so match both. */
const proxy = (path: string) => new RegExp(`/api/grow-proxy/${path}/?(\\?.*)?$`);

/**
 * Serves the frozen API world. A call beyond it is answered 599 and returned in `unstubbed`, so a test can fail on it
 * instead of the app quietly reaching staging.
 */
export async function installApi(page: Page) {
  const unstubbed: string[] = [];
  await page.route("**/api/grow-proxy/**", (route) => {
    unstubbed.push(`${route.request().method()} ${route.request().url()}`);
    return route.fulfill({ status: 599, json: {} });
  });
  await page.route("**/regions/*.pmtiles", (route) => route.fulfill({ status: 404 }));
  await page.route(proxy("playback/context"), (route) => route.fulfill({ json: { country: "FR" } }));
  await page.route(proxy("regions/map"), (route) => route.fulfill({ json: regionIndex }));
  await page.route(proxy("regions/map/genres"), (route) => route.fulfill({ json: lexicon }));
  await page.route(proxy("genre-playlists/tree"), (route) => route.fulfill({ json: tree }));
  await page.route(proxy("genres/[^/]+"), (route) => {
    const id = new URL(route.request().url()).pathname.split("/").filter(Boolean).at(-1) ?? "";
    const detail = genreDetails[id as keyof typeof genreDetails];
    return detail ? route.fulfill({ json: detail }) : route.fulfill({ status: 404, json: {} });
  });
  await page.route(proxy("genres/[^/]+/overview"), (route) => {
    const id = new URL(route.request().url()).pathname.split("/").filter(Boolean).at(-2) ?? "";
    const key = (["rock", "punk", "jazz", "pop"] as const).find((genre) => ids[genre] === id);
    return key ? route.fulfill({ json: genreOverview(key) }) : route.fulfill({ status: 404, json: {} });
  });
  await page.route(proxy("genres/[^/]+/history"), (route) => route.fulfill({ json: [] }));
  await page.route(proxy("library/songs"), (route) => route.fulfill({ json: artistSongsPage }));
  await page.route(proxy(`artists/${ids.artist}`), (route) => route.fulfill({ json: artist }));
  await page.route(proxy(`artists/${ids.artist}/genre-counts`), (route) => route.fulfill({ json: artistGenreCounts }));
  await page.route(proxy(`library/songs/${ids.song}`), (route) => route.fulfill({ json: song }));
  return { unstubbed };
}
