"use client";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SpotifyAllowlistPopup from "./SpotifyAllowlistPopup";

describe("SpotifyAllowlistPopup", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders title and explanation text", () => {
    render(
      <SpotifyAllowlistPopup backendMessage="Your account is not in the allowlist." onClose={onClose} />,
    );

    expect(screen.getAllByText(/Spotify account not in allowlist/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/The app is in testing mode. To sign in, your Spotify account must be added by the app owner/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/Spotify display name/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Spotify email address/i).length).toBeGreaterThan(0);
  });

  it("renders backend message when provided", () => {
    const message = "Your account is not in the allowlist.";
    render(<SpotifyAllowlistPopup backendMessage={message} onClose={onClose} />);

    expect(screen.getAllByText(message).length).toBeGreaterThan(0);
  });

  it("renders title and explanation when backendMessage is empty", () => {
    render(<SpotifyAllowlistPopup backendMessage="" onClose={onClose} />);

    expect(screen.getAllByText(/Spotify account not in allowlist/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/The app is in testing mode. To sign in, your Spotify account must be added by the app owner/i).length,
    ).toBeGreaterThan(0);
  });

  it("calls onClose when Back button is clicked", () => {
    render(<SpotifyAllowlistPopup backendMessage="Not allowed." onClose={onClose} />);

    const backButtons = screen.getAllByRole("button", { name: /Back/i });
    fireEvent.click(backButtons[0]);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("mailto link has expected subject when Email to request access is shown", () => {
    render(<SpotifyAllowlistPopup backendMessage="Not allowed." onClose={onClose} />);

    const link = screen.queryByRole("link", { name: /Email to request access/i });
    if (link && link.getAttribute("href")) {
      expect(link.getAttribute("href")).toMatch(/mailto:.+\?subject=.+allowlist/);
    }
  });
});
