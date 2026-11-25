import { describe, expect, it } from "vitest";
import { isBoundToUpstream } from "@lib/upstream-binding";

const CURRENT = "https://grow-api.example.org/v1/";

describe("isBoundToUpstream", () => {
  it("accepts a token issued for the current upstream", () => {
    expect(isBoundToUpstream(CURRENT, CURRENT)).toBe(true);
  });

  it("rejects a token issued for a different upstream", () => {
    expect(isBoundToUpstream("http://localhost:8000/v1/", CURRENT)).toBe(false);
  });

  it("rejects a token with no recorded upstream", () => {
    expect(isBoundToUpstream(undefined, CURRENT)).toBe(false);
  });
});
