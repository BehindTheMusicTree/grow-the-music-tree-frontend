import { describe, it, expect } from "vitest";
import { formatDuration } from "./importedOn";

const START = "2026-10-12T10:00:00Z";

describe("formatDuration", () => {
  it.each([
    ["2026-10-12T10:00:42Z", "42 s"],
    ["2026-10-12T10:03:59Z", "3 min"],
    ["2026-10-12T12:05:00Z", "2 h 05 min"],
    ["2026-10-12T09:59:00Z", "0 s"],
  ])("formats %s", (end, expected) => {
    expect(formatDuration(START, end)).toBe(expected);
  });

  it("accepts epoch ms as the end", () => {
    expect(formatDuration(START, Date.parse(START) + 90_000)).toBe("1 min");
  });
});
