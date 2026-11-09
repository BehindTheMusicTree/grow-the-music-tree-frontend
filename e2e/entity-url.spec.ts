import { expect, test, type Page } from "@playwright/test";
import { installApi } from "./support/api";
import { ids, names } from "./support/fixtures";
import { APP_TITLE, expectState, expectUrlInvariants } from "./support/invariants";

let unstubbed: string[] = [];

test.beforeEach(async ({ page }) => {
  ({ unstubbed } = await installApi(page));
});

test.afterEach(() => {
  expect(unstubbed, "API calls with no stub").toEqual([]);
});

const toMap = (page: Page) => page.getByRole("link", { name: "Region map" }).click();
const toTree = (page: Page) => page.getByRole("link", { name: "GrowTheMusicTree home" }).click();
const param = (page: Page, key: string) => new URL(page.url()).searchParams.get(key);

for (const [kind, id, panel, title] of [
  ["artist", ids.artist, names.artist, names.artist],
  ["song", ids.song, names.song, names.songTab],
] as const) {
  test(`${kind}: tree → map → back → forward → tree keeps the panel and title`, async ({ page }) => {
    await page.goto(`/?${kind}=${id}`);
    await expectState(page, { title, panel });

    await toMap(page);
    await expect(page).toHaveURL(/\/map\?/);
    expect(param(page, kind)).toBe(id);
    await expectState(page, { title, panel });

    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`/\\?${kind}=`));
    await expectState(page, { title, panel });

    await page.goForward();
    await expect(page).toHaveURL(/\/map\?/);
    await expectState(page, { title, panel });

    await toTree(page);
    await expect(page).toHaveURL(new RegExp(`^[^?]*/\\?${kind}=`));
    expect(param(page, kind)).toBe(id);
    await expectState(page, { title, panel });
  });
}

test("genre: tree → map frames the region and keeps the genre panel", async ({ page }) => {
  await page.goto(`/?genre=${ids.punk}`);
  await expectState(page, { title: APP_TITLE, panel: names.punk });
  await toMap(page);
  expect(param(page, "genre")).toBe(ids.punk);
  await expectState(page, { title: APP_TITLE, panel: names.punk });
  await expect(page.locator("canvas.maplibregl-canvas")).toBeVisible();
  await expect(page.getByText("This genre has no region on the map.")).toHaveCount(0);
});

test("artist filter + genre: survives tree → map → tree, and both titles follow the genre panel", async ({ page }) => {
  await page.goto(`/?artist=${ids.artist}&genre=${ids.punk}`);
  await expectState(page, { title: APP_TITLE, panel: names.punk });
  await toMap(page);
  expect(param(page, "artist")).toBe(ids.artist);
  expect(param(page, "genre")).toBe(ids.punk);
  await expectState(page, { title: APP_TITLE, panel: names.punk });
  await toTree(page);
  expect(param(page, "artist")).toBe(ids.artist);
  expect(param(page, "genre")).toBe(ids.punk);
  await expectState(page, { title: APP_TITLE, panel: names.punk });
});

test("panning the map writes `at` without adding history entries", async ({ page }) => {
  await page.goto("/map");
  const canvas = page.locator("canvas.maplibregl-canvas");
  await expect(canvas).toBeVisible();
  const before = await page.evaluate(() => history.length);
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2 + 60, { steps: 8 });
  await page.mouse.up();
  await expect.poll(() => param(page, "at")).not.toBeNull();
  expect(await page.evaluate(() => history.length)).toBe(before);
  await expectUrlInvariants(page);
});

test("closing the panel clears the entity params and restores the base title", async ({ page }) => {
  await page.goto(`/map?artist=${ids.artist}`);
  await expectState(page, { title: names.artist, panel: names.artist });
  await page.getByRole("button", { name: "Close panel" }).click();
  await expect.poll(() => param(page, "artist")).toBeNull();
  await expectState(page, { title: APP_TITLE });
});

test("shared links open directly on each view", async ({ page }) => {
  for (const path of [`/?song=${ids.song}`, `/map?song=${ids.song}`, `/map?artist=${ids.artist}`, `/?genre=${ids.punk}`]) {
    await page.goto(path);
    const panel = path.includes("song") ? names.song : path.includes("artist") ? names.artist : names.punk;
    const title = path.includes("song") ? names.songTab : path.includes("artist") ? names.artist : APP_TITLE;
    await expectState(page, { title, panel });
  }
});

test("a genre without a region says so on the map", async ({ page }) => {
  await page.goto(`/map?genre=${ids.jazz}`);
  await expect(page.getByText("This genre has no region on the map.")).toBeVisible();
  await expectState(page, { title: APP_TITLE, panel: names.jazz });
});
