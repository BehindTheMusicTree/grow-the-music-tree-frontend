"use client";

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import GenreCreationPopup from "./GenreCreationPopup";

const mutateMock = vi.fn();
const formErrorsMock = vi.fn((): { field: string; message: string }[] => []);

vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api/grow-proxy" }));
vi.mock("@behindthemusictree/app-kit/genre-tree", () => ({
  useCreateGenre: () => ({ mutate: mutateMock, formErrors: formErrorsMock() }),
}));

const parent = { uuid: "00000000-0000-0000-0000-000000000000", name: "Rock" };

describe("GenreCreationPopup", () => {
  afterEach(() => {
    cleanup();
    mutateMock.mockReset();
    formErrorsMock.mockReturnValue([]);
  });

  it("starts with an empty name field", () => {
    render(<GenreCreationPopup onClose={vi.fn()} />);

    const [, nameInput] = screen.getAllByRole("textbox");
    expect(nameInput).toHaveValue("");
  });

  it("shows '(root genre)' in the disabled parent field when no parent is given", () => {
    render(<GenreCreationPopup onClose={vi.fn()} />);

    const [parentInput] = screen.getAllByRole("textbox");
    expect(parentInput).toHaveValue("(root genre)");
  });

  it("shows the parent's name in the disabled parent field when a parent is given", () => {
    render(<GenreCreationPopup onClose={vi.fn()} parent={parent} />);

    const [parentInput] = screen.getAllByRole("textbox");
    expect(parentInput).toHaveValue("Rock");
  });

  it("creates the genre under its parent and closes only on success when Save is clicked", () => {
    const onClose = vi.fn();
    render(<GenreCreationPopup onClose={onClose} parent={parent} />);

    const [, nameInput] = screen.getAllByRole("textbox");
    fireEvent.change(nameInput, { target: { value: "Jazz" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(mutateMock).toHaveBeenCalledWith({ name: "Jazz", parent: parent.uuid }, { onSuccess: onClose });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("creates a root genre when no parent is given", () => {
    render(<GenreCreationPopup onClose={vi.fn()} />);

    const [, nameInput] = screen.getAllByRole("textbox");
    fireEvent.change(nameInput, { target: { value: "Jazz" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(mutateMock).toHaveBeenCalledWith({ name: "Jazz", parent: undefined }, expect.anything());
  });

  it("calls onClose when Cancel is clicked", () => {
    const onClose = vi.fn();
    render(<GenreCreationPopup onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders the form errors from the mutation", () => {
    formErrorsMock.mockReturnValue([{ field: "name", message: "Name is required" }]);
    render(<GenreCreationPopup onClose={vi.fn()} />);

    expect(screen.getByText("Name is required")).toBeInTheDocument();
  });
});
