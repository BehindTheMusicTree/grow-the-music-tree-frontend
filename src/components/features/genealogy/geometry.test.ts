import { describe, expect, it } from "vitest";
import { HEADER_HEIGHT, HEADER_ROW_HEIGHT, headerHeight, showsColumnLabels } from "./geometry";

describe("headerHeight", () => {
  it("keeps only the region row while column labels are hidden", () => {
    expect(showsColumnLabels(1)).toBe(false);
    expect(headerHeight(1)).toBe(HEADER_ROW_HEIGHT);
  });

  it("adds the column-label row once columns are wide enough", () => {
    expect(showsColumnLabels(2)).toBe(true);
    expect(headerHeight(2)).toBe(HEADER_HEIGHT);
  });
});
