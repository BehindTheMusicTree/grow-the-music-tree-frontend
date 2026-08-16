"use client";

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import GenreCreationPopup from "./GenreCreationPopup";

const parent = { uuid: "00000000-0000-0000-0000-000000000000", name: "Rock" };

describe("GenreCreationPopup", () => {
  afterEach(() => {
    cleanup();
  });

  it("starts with an empty name field", () => {
    render(<GenreCreationPopup onSubmit={vi.fn()} />);

    const [, nameInput] = screen.getAllByRole("textbox");
    expect(nameInput).toHaveValue("");
  });

  it("shows '(root genre)' in the disabled parent field when no parent is given", () => {
    render(<GenreCreationPopup onSubmit={vi.fn()} />);

    const [parentInput] = screen.getAllByRole("textbox");
    expect(parentInput).toHaveValue("(root genre)");
  });

  it("shows the parent's name in the disabled parent field when a parent is given", () => {
    render(<GenreCreationPopup onSubmit={vi.fn()} parent={parent} />);

    const [parentInput] = screen.getAllByRole("textbox");
    expect(parentInput).toHaveValue("Rock");
  });

  it("calls onSubmit with the entered name and parent uuid when Save is clicked", () => {
    const onSubmit = vi.fn();
    render(<GenreCreationPopup onSubmit={onSubmit} parent={parent} />);

    const [, nameInput] = screen.getAllByRole("textbox");
    fireEvent.change(nameInput, { target: { value: "Jazz" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledWith({ name: "Jazz", parent: parent.uuid });
  });

  it("calls onSubmit with an undefined parent when none is given", () => {
    const onSubmit = vi.fn();
    render(<GenreCreationPopup onSubmit={onSubmit} />);

    const [, nameInput] = screen.getAllByRole("textbox");
    fireEvent.change(nameInput, { target: { value: "Jazz" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledWith({ name: "Jazz", parent: undefined });
  });

  it("calls onClose when Cancel is clicked", () => {
    const onClose = vi.fn();
    render(<GenreCreationPopup onSubmit={vi.fn()} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders form errors when provided", () => {
    render(
      <GenreCreationPopup onSubmit={vi.fn()} formErrors={[{ field: "name", message: "Name is required" }]} />,
    );

    expect(screen.getByText("Name is required")).toBeInTheDocument();
  });
});
