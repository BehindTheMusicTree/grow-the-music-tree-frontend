import { describe, it, expect } from "vitest";
import { formatTime, capitalizeFirstLetter } from "./formatting";

describe("formatTime", () => {
  it("formats seconds correctly with leading zero", () => {
    expect(formatTime(5)).toBe("0:05");
  });

  it("formats seconds correctly without leading zero", () => {
    expect(formatTime(45)).toBe("0:45");
  });

  it("formats minutes and seconds correctly", () => {
    expect(formatTime(125)).toBe("2:05");
    expect(formatTime(185)).toBe("3:05");
  });

  it("handles zero seconds", () => {
    expect(formatTime(0)).toBe("0:00");
  });

  it("handles full minutes", () => {
    expect(formatTime(60)).toBe("1:00");
    expect(formatTime(180)).toBe("3:00");
  });

  it("formats longer durations correctly", () => {
    expect(formatTime(3661)).toBe("61:01");
  });
});

describe("capitalizeFirstLetter", () => {
  it("capitalizes the first letter of a lowercase string", () => {
    expect(capitalizeFirstLetter("hello")).toBe("Hello");
  });

  it("leaves already capitalized string unchanged", () => {
    expect(capitalizeFirstLetter("World")).toBe("World");
  });

  it("handles single character", () => {
    expect(capitalizeFirstLetter("a")).toBe("A");
  });

  it("handles empty string", () => {
    expect(capitalizeFirstLetter("")).toBe("");
  });

  it("handles strings with spaces", () => {
    expect(capitalizeFirstLetter("hello world")).toBe("Hello world");
  });

  it("handles all caps string", () => {
    expect(capitalizeFirstLetter("HELLO")).toBe("HELLO");
  });
});
