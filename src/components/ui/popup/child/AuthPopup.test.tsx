"use client";

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import AuthPopup from "./AuthPopup";

describe("AuthPopup", () => {
  afterEach(() => {
    cleanup();
  });

  it("calls handleSpotifyOAuth with redirectAfterAuthPath when the Spotify button is clicked", () => {
    const handleSpotifyOAuth = vi.fn();
    render(<AuthPopup handleSpotifyOAuth={handleSpotifyOAuth} redirectAfterAuthPath="/library" />);

    fireEvent.click(screen.getByRole("button", { name: /Sign in with Spotify/i }));

    expect(handleSpotifyOAuth).toHaveBeenCalledWith("/library");
  });

  it("shows the Google button and wires it to handleGoogleOAuth when provided and not spotifyOnly", () => {
    const handleGoogleOAuth = vi.fn();
    render(
      <AuthPopup
        handleSpotifyOAuth={vi.fn()}
        handleGoogleOAuth={handleGoogleOAuth}
        redirectAfterAuthPath="/library"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Sign in with Google/i }));

    expect(handleGoogleOAuth).toHaveBeenCalledWith("/library");
  });

  it("hides the Google button when spotifyOnly is true", () => {
    render(<AuthPopup handleSpotifyOAuth={vi.fn()} handleGoogleOAuth={vi.fn()} spotifyOnly />);

    expect(screen.queryByRole("button", { name: /Sign in with Google/i })).not.toBeInTheDocument();
  });

  it("hides the Google button when handleGoogleOAuth is not provided", () => {
    render(<AuthPopup handleSpotifyOAuth={vi.fn()} />);

    expect(screen.queryByRole("button", { name: /Sign in with Google/i })).not.toBeInTheDocument();
  });

  it("shows the spotifyOnly title and message when spotifyOnly is true", () => {
    render(<AuthPopup handleSpotifyOAuth={vi.fn()} spotifyOnly />);

    expect(screen.getByText("Connect with Spotify")).toBeInTheDocument();
    expect(screen.getByText(/My Spotify Library/)).toBeInTheDocument();
  });

  it("shows the default title and message when spotifyOnly is not set", () => {
    render(<AuthPopup handleSpotifyOAuth={vi.fn()} />);

    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByText(/Music Tree/)).toBeInTheDocument();
  });

  it("renders the optional message when provided", () => {
    render(<AuthPopup handleSpotifyOAuth={vi.fn()} message="Session expired" />);

    expect(screen.getByText("Session expired")).toBeInTheDocument();
  });

  it("is not dismissable", () => {
    render(<AuthPopup handleSpotifyOAuth={vi.fn()} />);

    expect(screen.queryByLabelText("Close popup")).not.toBeInTheDocument();
  });
});
