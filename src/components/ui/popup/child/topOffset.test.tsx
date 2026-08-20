"use client";

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ErrorCode } from "@behindthemusictree/app-kit/transport";
import { BANNER_HEIGHT } from "@lib/constants/layout";
import GenreRenamePopup from "./GenreRenamePopup";
import ImagePopup from "./ImagePopup";
import FormPopup from "./FormPopup";
import NetworkErrorPopup from "./NetworkErrorPopup";
import GenreCreationPopup from "./GenreCreationPopup";
import InternalErrorPopup from "./InternalErrorPopup";
import InvalidInputPopup from "./InvalidInputPopup";

const genre = { uuid: "00000000-0000-0000-0000-000000000000", name: "Rock" };

const popups: Array<[string, () => React.ReactElement]> = [
  ["GenreRenamePopup", () => <GenreRenamePopup onSubmit={vi.fn()} genre={genre} />],
  ["ImagePopup", () => <ImagePopup imageUrl="https://example.com/image.jpg" />],
  [
    "FormPopup",
    () => (
      <FormPopup onSubmit={vi.fn()} onCancel={vi.fn()}>
        <div>content</div>
      </FormPopup>
    ),
  ],
  ["NetworkErrorPopup", () => <NetworkErrorPopup />],
  ["GenreCreationPopup", () => <GenreCreationPopup onSubmit={vi.fn()} />],
  ["InternalErrorPopup", () => <InternalErrorPopup errorCode={ErrorCode.CLIENT_INTERNAL_ERROR} />],
  ["InvalidInputPopup", () => <InvalidInputPopup details={{ message: "Invalid input" }} />],
];

describe("popup topOffset", () => {
  afterEach(() => {
    cleanup();
  });

  it.each(popups)("%s reserves BANNER_HEIGHT at the top of the viewport", (_name, renderPopup) => {
    render(renderPopup());

    const dialog = screen.getByRole("dialog");
    expect(dialog.style.top).toBe(`${BANNER_HEIGHT}px`);
  });
});
