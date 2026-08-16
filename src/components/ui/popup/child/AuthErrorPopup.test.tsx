"use client";

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import AuthErrorPopup from "./AuthErrorPopup";

describe("AuthErrorPopup", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the message", () => {
    render(<AuthErrorPopup message="Sign-in failed" onClose={vi.fn()} />);

    expect(screen.getByText("Sign-in failed")).toBeInTheDocument();
  });

  it("calls onClose when Close is clicked", () => {
    const onClose = vi.fn();
    render(<AuthErrorPopup message="Sign-in failed" onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
