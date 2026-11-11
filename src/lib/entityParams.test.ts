import { describe, expect, it } from "vitest";
import { readEntityParams, readQueryParam } from "./entityParams";

describe("readQueryParam", () => {
  it.each([["", null], ["   ", null], ["rock", "rock"], [" rock ", "rock"]])("reads %j as %j", (raw, expected) => {
    expect(readQueryParam(new URLSearchParams({ genre: raw }), "genre")).toBe(expected);
  });

  it("reads an absent parameter as null", () => {
    expect(readQueryParam(new URLSearchParams(), "genre")).toBeNull();
  });
});

describe("readEntityParams", () => {
  it("reads every entity parameter, empty ones as null", () => {
    expect(readEntityParams(new URLSearchParams("genre=&artist=a1&song=&region=Q1&tradition="))).toEqual({
      genre: null,
      artist: "a1",
      song: null,
      region: "Q1",
      tradition: null,
    });
  });
});
