import { expect, test } from "@playwright/test";

const region = {
  id: "FR", name: "France", kind: "country", parentId: "world", childIds: [], zoneIds: [],
  bbox: [-5, 42, 8, 51], mainBbox: [-5, 42, 8, 51], centroid: [2, 46], drillable: false,
  overviewItemId: null, inheritedOverviewItemId: null, genres: [], songCount: 0, genreCount: 0,
};

test.beforeEach(async ({ page }) => {
  await page.route("**/api/grow-proxy/playback/context{,/}", (route) => route.fulfill({ json: { country: "FR" } }));
  await page.route("**/api/grow-proxy/regions/map{,/}", (route) =>
    route.fulfill({ json: { regions: [region], tileset: "a".repeat(64), worldChildIds: ["FR"], worldZoneIds: [] } }),
  );
  await page.route("**/regions/*.pmtiles", (route) => route.fulfill({ status: 404 }));
});

test("headless Chromium provides WebGL", async ({ page }) => {
  await page.goto("/map");
  expect(await page.evaluate(() => Boolean(document.createElement("canvas").getContext("webgl2")))).toBe(true);
});

test("the region map does not fall back to the list", async ({ page }) => {
  await page.goto("/map");
  await expect(page.getByRole("group", { name: "Region map" })).toBeVisible();
  await expect(page.getByText("The map cannot be displayed on this device.")).toHaveCount(0);
  await expect(page.locator("canvas.maplibregl-canvas")).toBeVisible();
});
