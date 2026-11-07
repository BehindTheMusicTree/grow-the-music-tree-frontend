import { describe, expect, it } from "vitest";
import { treeGenreHref } from "./searchHrefs";

describe("searchHrefs", () => {
  it("keys the tree by genre playlist uuid, and gives no link without one", () => {
    expect(treeGenreHref("pl-1")).toBe("/?genre=pl-1");
    expect(treeGenreHref(null)).toBeNull();
  });
});
