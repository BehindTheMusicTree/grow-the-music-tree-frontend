"use client";

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import GenreRenamePopup from "./GenreRenamePopup";

const mutateMock = vi.fn();
const formErrorsMock = vi.fn((): { field: string; message: string }[] => []);

vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api/grow-proxy" }));
vi.mock("@behindthemusictree/app-kit/genre-tree", () => ({
  useUpdateGenre: () => ({ mutate: mutateMock, formErrors: formErrorsMock() }),
}));

const genre = { uuid: "00000000-0000-0000-0000-000000000000", name: "Rock" };

describe("GenreRenamePopup", () => {
  afterEach(() => {
    cleanup();
    mutateMock.mockReset();
    formErrorsMock.mockReturnValue([]);
  });

  it("pre-fills the name input with the genre's current name", () => {
    render(<GenreRenamePopup onClose={vi.fn()} genre={genre} />);

    expect(screen.getByRole("textbox")).toHaveValue("Rock");
  });

  it("renames the genre with the edited name and closes only on success when Save is clicked", () => {
    const onClose = vi.fn();
    render(<GenreRenamePopup onClose={onClose} genre={genre} />);

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Jazz" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(mutateMock).toHaveBeenCalledWith({ uuid: genre.uuid, data: { name: "Jazz" } }, { onSuccess: onClose });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("renames the genre on form submit", () => {
    render(<GenreRenamePopup onClose={vi.fn()} genre={genre} />);

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Jazz" } });
    fireEvent.submit(screen.getByRole("textbox").closest("form")!);

    expect(mutateMock).toHaveBeenCalledWith({ uuid: genre.uuid, data: { name: "Jazz" } }, expect.anything());
  });

  it("calls onClose when Cancel is clicked", () => {
    const onClose = vi.fn();
    render(<GenreRenamePopup onClose={onClose} genre={genre} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders every form error from the mutation, keeping the typed name", () => {
    formErrorsMock.mockReturnValue([
      { field: "name", message: "Name already exists" },
      { field: "name", message: "Name is too long" },
    ]);
    render(<GenreRenamePopup onClose={vi.fn()} genre={genre} />);

    expect(screen.getByText("Name already exists")).toBeInTheDocument();
    expect(screen.getByText("Name is too long")).toBeInTheDocument();
  });
});
