import { describe, it, expect } from "vitest";
import { formatViewport, parseViewport } from "./useGenreTreeUrlState";

describe("parseViewport", () => {
  it("parses x,y,zoom", () => {
    expect(parseViewport("12.5,-3,0.75")).toEqual({ x: 12.5, y: -3, zoom: 0.75 });
  });

  it.each([null, "", "1,2", "1,2,3,4", "a,b,c", "1,2,0", "1,2,-1", "1,Infinity,1"])("rejects %j", (raw) => {
    expect(parseViewport(raw)).toBeUndefined();
  });
});

describe("formatViewport", () => {
  it("rounds x and y to one decimal and zoom to two", () => {
    expect(formatViewport({ x: 10.04, y: -20, zoom: 0.5 })).toBe("10.0,-20.0,0.50");
  });
});
