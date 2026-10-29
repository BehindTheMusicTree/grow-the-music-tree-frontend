"use client";

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import GenreCreationPopup from "./GenreCreationPopup";
import { makeGenreUuid } from "@behindthemusictree/app-kit/genre-tree/testing";

const mutateMock = vi.fn();
const formErrorsMock = vi.fn((): { field: string; message: string }[] => []);

vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api/grow-proxy" }));
vi.mock("@behindthemusictree/app-kit/genre-tree", () => ({
  useCreateGenre: () => ({ mutate: mutateMock, formErrors: formErrorsMock() }),
}));

const parent = { uuid: makeGenreUuid("00000000-0000-0000-0000-000000000000"), name: "Rock" };

describe("GenreCreationPopup", () => {
  afterEach(() => {
    cleanup();
    mutateMock.mockReset();
    formErrorsMock.mockReturnValue([]);
  });

  it("starts with an empty name field", () => {
    render(<GenreCreationPopup onClose={vi.fn()} onCreated={vi.fn()} />);

    const [, nameInput] = screen.getAllByRole("textbox");
    expect(nameInput).toHaveValue("");
  });

  it("shows '(root genre)' in the disabled parent field when no parent is given", () => {
    render(<GenreCreationPopup onClose={vi.fn()} onCreated={vi.fn()} />);

    const [parentInput] = screen.getAllByRole("textbox");
    expect(parentInput).toHaveValue("(root genre)");
  });

  it("shows the parent's name in the disabled parent field when a parent is given", () => {
    render(<GenreCreationPopup onClose={vi.fn()} onCreated={vi.fn()} parent={parent} />);

    const [parentInput] = screen.getAllByRole("textbox");
    expect(parentInput).toHaveValue("Rock");
  });

  it("creates the genre under its parent and closes only on success when Save is clicked", () => {
    const onClose = vi.fn();
    render(<GenreCreationPopup onClose={onClose} onCreated={vi.fn()} parent={parent} />);

    const [, nameInput] = screen.getAllByRole("textbox");
    fireEvent.change(nameInput, { target: { value: "Jazz" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(mutateMock).toHaveBeenCalledWith({ name: "Jazz", parent: parent.uuid }, { onSuccess: expect.any(Function) });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes and reports the created genre's tree node id on success", () => {
    const onClose = vi.fn();
    const onCreated = vi.fn();
    render(<GenreCreationPopup onClose={onClose} onCreated={onCreated} />);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    const [, { onSuccess }] = mutateMock.mock.calls[0];
    onSuccess({ criteriaPlaylist: { uuid: "playlist-uuid" } });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onCreated).toHaveBeenCalledWith("playlist-uuid");
  });

  it("does not report a created genre before the mutation succeeds", () => {
    const onCreated = vi.fn();
    render(<GenreCreationPopup onClose={vi.fn()} onCreated={onCreated} />);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onCreated).not.toHaveBeenCalled();
  });

  it("creates a root genre when no parent is given", () => {
    render(<GenreCreationPopup onClose={vi.fn()} onCreated={vi.fn()} />);

    const [, nameInput] = screen.getAllByRole("textbox");
    fireEvent.change(nameInput, { target: { value: "Jazz" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(mutateMock).toHaveBeenCalledWith({ name: "Jazz", parent: undefined }, expect.anything());
  });

  it("calls onClose when Cancel is clicked", () => {
    const onClose = vi.fn();
    render(<GenreCreationPopup onClose={onClose} onCreated={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders the form errors from the mutation", () => {
    formErrorsMock.mockReturnValue([{ field: "name", message: "Name is required" }]);
    render(<GenreCreationPopup onClose={vi.fn()} onCreated={vi.fn()} />);

    expect(screen.getByText("Name is required")).toBeInTheDocument();
  });
});
