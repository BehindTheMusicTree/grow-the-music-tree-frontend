import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { renderPlaceLink } from "./renderPlaceLink";

afterEach(cleanup);

describe("renderPlaceLink", () => {
  it("links the origin to its map region", () => {
    const origin = { name: "Paris", kind: "City", source: "begin_area" as const, wikidataId: "Q90", longitude: 2.35, latitude: 48.85, regionId: "Q90" };
    render(<>{renderPlaceLink(origin)}</>);
    expect(screen.getByRole("link", { name: "Paris" })).toHaveAttribute("href", "/map?region=Q90");
  });
});
