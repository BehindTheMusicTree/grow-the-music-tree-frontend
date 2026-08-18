"use client";

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import GenreRenamePopup from "./GenreRenamePopup";

const genre = { uuid: "00000000-0000-0000-0000-000000000000", name: "Rock" };

describe("GenreRenamePopup", () => {
  afterEach(() => {
    cleanup();
  });

  it("pre-fills the name input with the genre's current name", () => {
    render(<GenreRenamePopup onSubmit={vi.fn()} genre={genre} />);

    expect(screen.getByRole("textbox")).toHaveValue("Rock");
  });

  it("updates the input value as the user types", () => {
    render(<GenreRenamePopup onSubmit={vi.fn()} genre={genre} />);

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Jazz" } });

    expect(screen.getByRole("textbox")).toHaveValue("Jazz");
  });

  it("calls onSubmit with the edited name when Save is clicked", () => {
    const onSubmit = vi.fn();
    render(<GenreRenamePopup onSubmit={onSubmit} genre={genre} />);

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Jazz" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledWith({ name: "Jazz" });
  });

  it("calls onSubmit with the edited name on form submit", () => {
    const onSubmit = vi.fn();
    render(<GenreRenamePopup onSubmit={onSubmit} genre={genre} />);

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Jazz" } });
    fireEvent.submit(screen.getByRole("textbox").closest("form")!);

    expect(onSubmit).toHaveBeenCalledWith({ name: "Jazz" });
  });

  it("calls onClose when Cancel is clicked", () => {
    const onClose = vi.fn();
    render(<GenreRenamePopup onSubmit={vi.fn()} genre={genre} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders form errors when provided", () => {
    render(
      <GenreRenamePopup
        onSubmit={vi.fn()}
        genre={genre}
        formErrors={[{ field: "name", message: "Name already exists" }]}
      />,
    );

    expect(screen.getByText("Name already exists")).toBeInTheDocument();
  });

  it("renders no form errors when none are provided", () => {
    render(<GenreRenamePopup onSubmit={vi.fn()} genre={genre} />);

    expect(screen.queryByText(/already exists/)).not.toBeInTheDocument();
  });
});
