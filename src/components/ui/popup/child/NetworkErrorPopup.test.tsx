"use client";

import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ErrorCode } from "@behindthemusictree/app-kit/transport";
import NetworkErrorPopup from "./NetworkErrorPopup";

describe("NetworkErrorPopup", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the offline message", () => {
    render(<NetworkErrorPopup errorCode={ErrorCode.NETWORK_OFFLINE} />);

    expect(screen.getByText(/not connected to the internet/i)).toBeInTheDocument();
  });

  it("is not dismissable", () => {
    render(<NetworkErrorPopup errorCode={ErrorCode.NETWORK_OFFLINE} />);

    expect(screen.queryByLabelText("Close popup")).not.toBeInTheDocument();
  });
});
