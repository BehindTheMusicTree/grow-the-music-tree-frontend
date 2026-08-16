"use client";

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import GenreDeletionPopup from "./GenreDeletionPopup";

const genre = { uuid: "00000000-0000-0000-0000-000000000000", name: "Rock" };

describe("GenreDeletionPopup", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the genre name in the confirmation message", () => {
    render(<GenreDeletionPopup genre={genre} onConfirm={vi.fn()} />);

    expect(screen.getByText(/delete the genre "Rock"/)).toBeInTheDocument();
  });

  it("calls onConfirm and onClose with the genre when Delete is clicked", () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(<GenreDeletionPopup genre={genre} onConfirm={onConfirm} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(onConfirm).toHaveBeenCalledWith(genre);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose without onConfirm when Cancel is clicked", () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(<GenreDeletionPopup genre={genre} onConfirm={onConfirm} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
