import { expect, test } from "@playwright/test";
import { installApi } from "./support/api";
import { ids, tree } from "./support/fixtures";

test.beforeEach(async ({ page }) => {
  await installApi(page);
});

for (const width of [390, 640]) {
  test(`/map: expanded sheet stays resizable beside search at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(`/map?genre=${ids.punk}`);
    const handle = page.getByRole("button", { name: "Resize panel", exact: true });
    await expect(handle).toHaveAttribute("aria-expanded", "false");
    await handle.click();
    await expect(handle).toHaveAttribute("aria-expanded", "true");
    await page.getByRole("combobox").click({ trial: true });
    await page.getByRole("button", { name: "Sign in", exact: true }).click({ trial: true });
    await handle.click();
    await expect(handle).toHaveAttribute("aria-expanded", "false");
  });
}

for (const path of ["/", "/map"]) {
  test(`${path}: search fills the width below 640px and contains the account below 768px`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    const search = page.getByRole("combobox");
    await expect(search).toBeVisible();
    for (const width of [390, 639, 640, 767, 768, 1024]) {
      await page.setViewportSize({ width, height: 844 });
      if (width < 640) {
        await expect.poll(async () => (await search.boundingBox())!.width).toBeGreaterThan(width - 64);
      } else {
        await expect.poll(async () => (await search.boundingBox())!.width).toBeLessThan(450);
      }
      const box = (await search.boundingBox())!;
      const account = page.getByRole("button", { name: "Sign in", exact: true });
      await expect(account).toHaveCount(1);
      const accountBox = (await account.boundingBox())!;
      if (width < 768) {
        expect(Math.abs(accountBox.y + accountBox.height / 2 - box.y - box.height / 2)).toBeLessThan(1);
        expect(accountBox.x).toBeGreaterThan(box.x);
        expect(accountBox.x + accountBox.width).toBeLessThanOrEqual(box.x + box.width);
        expect(box.y).toBeLessThan(32);
      } else {
        expect(accountBox.x).toBeGreaterThan(box.x + box.width);
      }
      if (width < 640) expect(box.width).toBeGreaterThan(width - 64);
      else expect(box.width).toBeLessThan(450);
    }
  });

  test(`${path}: mobile account menu stays usable beside Clear`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route("**/api/auth/session", (route) => route.fulfill({ json: {
      user: { name: "Test Admin", email: "admin@example.com" }, expires: "2099-01-01T00:00:00.000Z",
    } }));
    await page.goto(`${path}?genre=${ids.punk}`);
    await expect(page.getByRole("button", { name: "Close panel", exact: true }).first()).toBeVisible();
    await page.getByRole("button", { name: "Account", exact: true }).click();
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    const box = (await menu.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
    await expect(page.getByRole("menuitem", { name: "Sign out" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  });
}

for (const hasTouch of [false, true]) {
  test.describe(`navigation alignment, touch=${hasTouch}`, () => {
    test.use({ hasTouch });
    test("centres navigation and tree controls on the same row", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.route("**/api/grow-proxy/genre-playlists/tree**", (route) => route.fulfill({
        json: tree.map((genre) => ({ ...genre, viewsCount: 100 })),
      }));
      await page.goto("/");
      const navigation = page.getByRole("navigation", { name: "Main navigation" });
      const control = hasTouch
        ? page.getByRole("group", { name: "Size nodes by" })
        : page.getByRole("group", { name: "Zoom controls" });
      await expect(control).toBeVisible();
      const navBox = (await navigation.boundingBox())!;
      const controlBox = (await control.boundingBox())!;
      expect(Math.abs(navBox.y + navBox.height / 2 - controlBox.y - controlBox.height / 2)).toBeLessThan(1);
    });
  });
}
