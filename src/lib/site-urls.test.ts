import { describe, it, expect } from "vitest";
import { getGrowBackendBaseUrl } from "./site-urls";

describe("getGrowBackendBaseUrl", () => {
  it("returns the same-origin grow-proxy path", () => {
    expect(getGrowBackendBaseUrl()).toBe("/api/grow-proxy");
  });
});
