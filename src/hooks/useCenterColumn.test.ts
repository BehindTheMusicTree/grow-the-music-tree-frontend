import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCenterColumn } from "./useCenterColumn";

function setup(initial: { about?: boolean; detailExpanded?: boolean; tracklistExpanded?: boolean } = {}) {
  const fns = {
    closeAbout: vi.fn(),
    setDetailExpanded: vi.fn(),
    setTracklistExpanded: vi.fn(),
  };
  const props = { about: false, detailExpanded: false, tracklistExpanded: false, ...initial, ...fns };
  const view = renderHook((p: typeof props) => useCenterColumn(p), { initialProps: props });
  return { ...fns, props, rerender: (next: Partial<typeof props>) => view.rerender({ ...props, ...next }) };
}

describe("useCenterColumn", () => {
  it("does nothing while no surface is open", () => {
    const { closeAbout, setDetailExpanded, setTracklistExpanded } = setup();
    expect(closeAbout).not.toHaveBeenCalled();
    expect(setDetailExpanded).not.toHaveBeenCalled();
    expect(setTracklistExpanded).not.toHaveBeenCalled();
  });

  it("collapses the detail panel and the tracklist when About opens", () => {
    const { rerender, setDetailExpanded, setTracklistExpanded, closeAbout } = setup({
      detailExpanded: true,
      tracklistExpanded: true,
    });
    setDetailExpanded.mockClear();
    setTracklistExpanded.mockClear();
    closeAbout.mockClear();

    rerender({ about: true, detailExpanded: true, tracklistExpanded: true });

    expect(setDetailExpanded).toHaveBeenCalledWith(false);
    expect(setTracklistExpanded).toHaveBeenCalledWith(false);
    expect(closeAbout).not.toHaveBeenCalled();
  });

  it("closes About and collapses the tracklist when the detail panel expands", () => {
    const { rerender, closeAbout, setTracklistExpanded } = setup({ about: true });
    rerender({ about: true, detailExpanded: true });
    expect(closeAbout).toHaveBeenCalledOnce();
    expect(setTracklistExpanded).toHaveBeenCalledWith(false);
  });

  it("closes About and collapses the detail panel when the tracklist expands", () => {
    const { rerender, closeAbout, setDetailExpanded } = setup({ about: true });
    rerender({ about: true, tracklistExpanded: true });
    expect(closeAbout).toHaveBeenCalledOnce();
    expect(setDetailExpanded).toHaveBeenCalledWith(false);
  });

  it("does not touch About when a panel expands while About is closed", () => {
    const { rerender, closeAbout } = setup();
    rerender({ detailExpanded: true });
    rerender({ detailExpanded: false, tracklistExpanded: true });
    expect(closeAbout).not.toHaveBeenCalled();
  });

  it("keeps About open when it is already open on mount with the tracklist expanded", () => {
    const { closeAbout, setTracklistExpanded } = setup({ about: true, tracklistExpanded: true });
    expect(setTracklistExpanded).toHaveBeenCalledWith(false);
    expect(closeAbout).not.toHaveBeenCalled();
  });

  it("does nothing on re-renders without a surface opening", () => {
    const { rerender, closeAbout, setDetailExpanded, setTracklistExpanded } = setup({ tracklistExpanded: true });
    rerender({ tracklistExpanded: true });
    expect(closeAbout).not.toHaveBeenCalled();
    expect(setDetailExpanded).not.toHaveBeenCalled();
    expect(setTracklistExpanded).not.toHaveBeenCalled();
  });
});
