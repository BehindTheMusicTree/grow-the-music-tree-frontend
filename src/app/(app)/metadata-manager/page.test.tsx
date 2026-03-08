"use client";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MetadataManagerPage from "./page";

vi.mock("@contexts/PopupContext", () => ({
  usePopup: () => ({ showPopup: vi.fn(), hidePopup: vi.fn(), activePopup: null }),
}));

const mockMutateAsync = vi.fn();
vi.mock("@hooks/useAudioMetadata", () => ({
  useGetFullMetadata: () => ({ mutateAsync: mockMutateAsync }),
}));

describe("MetadataManagerPage", () => {
  beforeEach(() => {
    mockMutateAsync.mockReset();
  });

  it("renders the heading Metadata Manager", () => {
    render(<MetadataManagerPage />);
    expect(screen.getByRole("heading", { name: /metadata manager/i })).toBeInTheDocument();
  });

  it("shows No metadata when no file has been processed", () => {
    render(<MetadataManagerPage />);
    const noMetadataElements = screen.getAllByText("No metadata");
    expect(noMetadataElements.length).toBeGreaterThanOrEqual(1);
    expect(noMetadataElements[0]).toBeInTheDocument();
  });

  it("after selecting a file and the mutation resolving, the returned metadata is displayed", async () => {
    const metadata = { title: "Test Track", artist: "Test Artist" };
    mockMutateAsync.mockResolvedValue(metadata);

    render(<MetadataManagerPage />);
    const input = document.querySelector('input[type="file"]');
    if (!input) throw new Error("File input not found");

    fireEvent.change(input, { target: { files: [new File([], "test.mp3", { type: "audio/mpeg" })] } });

    await waitFor(() => {
      expect(screen.getByText(/"title":\s*"Test Track"/)).toBeInTheDocument();
    });
    expect(screen.getByText(/"artist":\s*"Test Artist"/)).toBeInTheDocument();
  });
});
