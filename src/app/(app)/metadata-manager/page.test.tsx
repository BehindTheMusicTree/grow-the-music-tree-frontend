"use client";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MetadataManagerPage from "./page";

const showPopupMock = vi.fn();
vi.mock("@contexts/PopupContext", () => ({
  usePopup: () => ({ showPopup: showPopupMock, hidePopup: vi.fn(), activePopup: null }),
}));

vi.mock("@hooks/useAudioMetadata", () => ({
  useGetFullMetadata: () => ({ mutateAsync: vi.fn() }),
}));

describe("MetadataManagerPage", () => {
  beforeEach(() => {
    showPopupMock.mockClear();
  });

  it("renders the heading Metadata Manager", () => {
    render(<MetadataManagerPage />);
    expect(screen.getByRole("heading", { name: /metadata manager/i })).toBeInTheDocument();
  });

  it("shows No metadata when no file has been processed", () => {
    render(<MetadataManagerPage />);
    const noMetadataElements = screen.getAllByText("No metadata");
    expect(noMetadataElements).toHaveLength(6);
  });

  it("calls showPopup with upload popup and selected file when user selects a file", () => {
    render(<MetadataManagerPage />);
    const [input] = screen.getAllByLabelText(/choose an audio file/i);
    const file = new File([], "test.mp3", { type: "audio/mpeg" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(showPopupMock).toHaveBeenCalledTimes(1);
    const popupElement = showPopupMock.mock.calls[0][0];
    expect(popupElement.props.files).toHaveLength(1);
    expect(popupElement.props.files[0]).toBe(file);
  });
});
