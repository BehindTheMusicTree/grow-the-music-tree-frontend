"use client";

import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ErrorCode } from "@behindthemusictree/app-kit/transport";
import InternalErrorPopup from "./InternalErrorPopup";

describe("InternalErrorPopup", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the error code", () => {
    render(<InternalErrorPopup errorCode={ErrorCode.CLIENT_INTERNAL_ERROR} />);

    expect(screen.getByText(`Error Code: ${ErrorCode.CLIENT_INTERNAL_ERROR}`)).toBeInTheDocument();
  });

  it("is not dismissable", () => {
    render(<InternalErrorPopup errorCode={ErrorCode.CLIENT_INTERNAL_ERROR} />);

    expect(screen.queryByLabelText("Close popup")).not.toBeInTheDocument();
  });
});
