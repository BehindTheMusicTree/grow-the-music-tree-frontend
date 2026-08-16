"use client";

import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import ImagePopup from "./ImagePopup";

describe("ImagePopup", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the image", () => {
    render(<ImagePopup imageUrl="https://example.com/image.jpg" />);

    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("uses a default alt text when none is provided", () => {
    render(<ImagePopup imageUrl="https://example.com/image.jpg" />);

    expect(screen.getByAltText("Popup image")).toBeInTheDocument();
  });

  it("uses the given alt text when provided", () => {
    render(<ImagePopup imageUrl="https://example.com/image.jpg" alt="Album cover" />);

    expect(screen.getByAltText("Album cover")).toBeInTheDocument();
  });
});
