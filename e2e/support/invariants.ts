import { expect, type Page } from "@playwright/test";

export const APP_TITLE = "GrowTheMusicTree";

/** View-state params belong to one page; they must never show up on the other. */
export async function expectUrlInvariants(page: Page) {
  const url = new URL(page.url());
  if (url.pathname === "/") {
    expect(url.searchParams.has("at"), "`at` leaked onto the tree").toBe(false);
    expect(url.searchParams.has("region"), "`region` leaked onto the tree").toBe(false);
  } else if (url.pathname === "/map") {
    expect(url.searchParams.has("view"), "`view` leaked onto the map").toBe(false);
    expect(url.searchParams.has("zoom"), "`zoom` leaked onto the map").toBe(false);
  }
}

/**
 * Lets requests and Next's metadata commit settle before reading the title: a title read early can match for a moment
 * (the base title before the artist loads, or the entity title before Next rewrites it) and hide a regression.
 */
export async function expectState(page: Page, { title, panel }: { title: string; panel?: string }) {
  if (panel) await expect(page.getByRole("complementary", { name: panel })).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  expect(await page.title(), "tab title").toBe(title);
  await expectUrlInvariants(page);
}
