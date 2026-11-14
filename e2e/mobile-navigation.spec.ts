import { expect, test, type Page } from "@playwright/test";
import { installApi } from "./support/api";
import { ids, names } from "./support/fixtures";

let unstubbed: string[] = [];

test.beforeEach(async ({ page }) => {
  ({ unstubbed } = await installApi(page));
});

test.afterEach(() => {
  expect(unstubbed, "API calls with no stub").toEqual([]);
});

async function expectFooter(page: Page) {
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  const viewport = page.viewportSize()!;
  const box = (await navigation.boundingBox())!;
  expect(box.x).toBe(0);
  expect(box.width).toBe(viewport.width);
  expect(box.y + box.height).toBe(viewport.height);
  expect(box.height).toBe(64);
  for (const label of ["Tree", "Map", "About"]) {
    await expect(navigation.getByText(label, { exact: true })).toBeVisible();
  }
  const items = navigation.getByRole("link").or(navigation.getByRole("button"));
  await expect(items).toHaveCount(3);
  for (const item of await items.all()) {
    const itemBox = (await item.boundingBox())!;
    expect(itemBox.width).toBeCloseTo(viewport.width / 3, 0);
    expect(itemBox.height).toBeGreaterThanOrEqual(44);
  }
  const main = (await page.getByRole("main").boundingBox())!;
  expect(main.y + main.height).toBeLessThanOrEqual(box.y);
}

for (const width of [375, 390]) {
  test(`mobile footer at ${width}px stays below the tree, map and detail sheets`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(`/?genre=${ids.punk}`);
    const navigation = page.getByRole("navigation", { name: "Main navigation" });
    const tree = navigation.getByRole("link", { name: "GrowTheMusicTree home" });
    const about = navigation.getByRole("link", { name: "About", exact: true });
    const panel = page.getByRole("complementary", { name: names.punk, exact: true });
    await expect(panel).toBeVisible();
    await expectFooter(page);
    await expect(tree).toHaveAttribute("data-active", "true");

    const resize = panel.getByRole("button", { name: "Resize panel" });
    await resize.click();
    await expect(resize).toHaveAttribute("aria-expanded", "true");
    await expectFooter(page);
    const panelBox = (await panel.boundingBox())!;
    expect(panelBox.y + panelBox.height).toBeLessThanOrEqual((await navigation.boundingBox())!.y);

    await navigation.getByRole("link", { name: "Region map" }).click();
    await expect(page).toHaveURL(/\/map\?/);
    await expect(panel).toBeVisible();
    await expectFooter(page);
    const map = navigation.getByRole("button", { name: "Region map" });
    await expect(map).toHaveAttribute("data-active", "true");
    await map.click();
    await expect(map).toHaveAttribute("aria-pressed", "true");

    await about.click();
    await expect(about).toHaveAttribute("data-active", "true");
    await expect(tree).toHaveAttribute("data-active", "false");
    await expectFooter(page);
    await about.click();
    await expect(about).toHaveAttribute("data-active", "false");
    await expectFooter(page);

    await page.setViewportSize({ width: 767, height: 375 });
    await expectFooter(page);
    await page.setViewportSize({ width: 768, height: 844 });
    await expect(navigation.getByText("Tree", { exact: true })).toBeHidden();
    expect((await navigation.boundingBox())!.width).toBeLessThan(768);
  });
}

test("the mobile player clears the footer, including a bottom safe area", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/?song=${ids.song}`);
  const panel = page.getByRole("complementary", { name: names.song, exact: true });
  await expect(panel).toBeVisible();
  await panel.getByRole("button", { name: "Play", exact: true }).click();
  const controls = page.getByRole("region", { name: "Player controls" });
  await expect(controls).toBeVisible();
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  const player = page.locator("#player-panel");
  await expect.poll(async () => {
    const playerBox = (await player.boundingBox())!;
    return playerBox.y + playerBox.height;
  }).toBeLessThanOrEqual((await navigation.boundingBox())!.y);
  await page.setViewportSize({ width: 767, height: 375 });
  await controls.scrollIntoViewIfNeeded();
  const controlsBox = (await controls.boundingBox())!;
  const landscapeNavBox = (await navigation.boundingBox())!;
  expect(controlsBox.y + controlsBox.height).toBeLessThanOrEqual(landscapeNavBox.y);
  await player.getByRole("button", { name: "Hide tracks" }).click();
  await controls.scrollIntoViewIfNeeded();
  const collapsedControlsBox = (await controls.boundingBox())!;
  expect(collapsedControlsBox.y + collapsedControlsBox.height).toBeLessThanOrEqual(landscapeNavBox.y);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "/tmp/mobile-bottom-navigation-player.png" });

  // Chromium reports a zero safe area; substitute 34px in the generated rules to exercise the inset arithmetic.
  await page.evaluate(() => {
    for (const sheet of Array.from(document.styleSheets)) {
      for (const rule of Array.from(sheet.cssRules)) {
        if (rule.cssText.includes("env(safe-area-inset-bottom)")) {
          const index = Array.from(sheet.cssRules).indexOf(rule);
          const replacement = rule.cssText.replaceAll("env(safe-area-inset-bottom)", "34px");
          sheet.deleteRule(index);
          sheet.insertRule(replacement, index);
        }
      }
    }
  });
  const navBox = (await navigation.boundingBox())!;
  expect(navBox.height).toBe(98);
  expect(navBox.y + navBox.height).toBe(844);
  const playerBox = (await player.boundingBox())!;
  expect(playerBox.y + playerBox.height).toBeLessThanOrEqual(navBox.y);
  await page.screenshot({ path: "/tmp/mobile-bottom-navigation-safe-area.png" });
});
