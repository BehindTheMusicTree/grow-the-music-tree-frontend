"use client";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import TrackUploadPopup from "./TrackUploadPopup";

describe("TrackUploadPopup", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_TRACK_UPLOAD_TIMEOUT_MS", "60000");
  });

  it("shows invalid file data message when onProcessFile rejects with InvalidInputError", async () => {
    const invalidError = new Error("Invalid file type");
    invalidError.name = "InvalidInputError";

    const onProcessFile = vi.fn().mockRejectedValue(invalidError);
    const file = new File([], "wrong-type.txt", { type: "text/plain" });

    render(
      <TrackUploadPopup files={[file]} onProcessFile={onProcessFile} onClose={onClose} />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Upload failed due to invalid file data. Please check your file and try again./),
      ).toBeInTheDocument();
    });

    expect(onProcessFile).toHaveBeenCalledWith(file, null);
  });
});
