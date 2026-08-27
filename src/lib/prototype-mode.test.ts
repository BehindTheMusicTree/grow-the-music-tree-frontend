import { describe, it, expect } from "vitest";
import { isPrototypeRoute } from "./prototype-mode";

describe("isPrototypeRoute", () => {
  it("returns true for the prototype root", () => {
    expect(isPrototypeRoute("/prototype")).toBe(true);
  });

  it("returns true for nested prototype paths", () => {
    expect(isPrototypeRoute("/prototype/reference-genre-tree")).toBe(true);
  });

  it("returns false for non-prototype paths", () => {
    expect(isPrototypeRoute("/reference-genre-tree")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isPrototypeRoute(null)).toBe(false);
  });
});
