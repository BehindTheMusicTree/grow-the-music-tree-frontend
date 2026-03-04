"use client";

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MetadataManagerPage from "./page";

vi.mock("@contexts/PopupContext", () => ({
  usePopup: () => ({ showPopup: vi.fn(), hidePopup: vi.fn(), activePopup: null }),
}));

vi.mock("@hooks/useAudioMetadata", () => ({
  useGetFullMetadata: () => ({ mutateAsync: vi.fn() }),
}));

describe("MetadataManagerPage", () => {
  it("renders the heading Metadata Manager", () => {
    render(<MetadataManagerPage />);
    expect(screen.getByRole("heading", { name: /metadata manager/i })).toBeInTheDocument();
  });
});
