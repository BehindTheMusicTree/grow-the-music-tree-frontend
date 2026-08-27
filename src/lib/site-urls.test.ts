import { describe, it, expect } from "vitest";
import { getGrowBackendBaseUrl, getGrowPrototypeBackendBaseUrl } from "./site-urls";

describe("getGrowBackendBaseUrl", () => {
  it("returns the same-origin grow-proxy path", () => {
    expect(getGrowBackendBaseUrl()).toBe("/api/grow-proxy");
  });
});

describe("getGrowPrototypeBackendBaseUrl", () => {
  it("returns the same-origin grow-prototype-proxy path", () => {
    expect(getGrowPrototypeBackendBaseUrl()).toBe("/api/grow-prototype-proxy");
  });
});
