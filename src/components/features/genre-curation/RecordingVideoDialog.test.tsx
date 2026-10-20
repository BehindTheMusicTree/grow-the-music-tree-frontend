import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { VideoForm } from "./RecordingVideoDialog";

const current = { youtubeVideoId: null, youtubeUnplayableReason: null };

function setup() {
  const onSave = vi.fn();
  render(<VideoForm recordingUuid="r1" current={current} isPending={false} onSave={onSave} onCancel={vi.fn()} />);
  return onSave;
}

describe("VideoForm", () => {
  afterEach(cleanup);

  it("parses a watch URL, previews it and saves the bare id", () => {
    const onSave = setup();

    fireEvent.change(screen.getByLabelText(/youtube url or id/i), {
      target: { value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    });

    expect(screen.getByTitle("Video preview")).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSave).toHaveBeenCalledWith({ youtubeVideoId: "dQw4w9WgXcQ", youtubeUnplayableReason: null }, current);
  });

  it("rejects garbage input and disables Save", () => {
    setup();

    fireEvent.change(screen.getByLabelText(/youtube url or id/i), { target: { value: "not a video" } });

    expect(screen.getByRole("alert")).toHaveTextContent(/not a youtube/i);
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });
});
