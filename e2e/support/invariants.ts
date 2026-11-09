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

/** Polls, because Next re-commits the layout title after a client navigation. Checks the URL invariants too. */
export async function expectState(page: Page, { title, panel }: { title: string; panel?: string }) {
  await expect.poll(() => page.title(), { message: "tab title" }).toBe(title);
  if (panel) await expect(page.getByRole("complementary", { name: panel })).toBeVisible();
  await expectUrlInvariants(page);
}
