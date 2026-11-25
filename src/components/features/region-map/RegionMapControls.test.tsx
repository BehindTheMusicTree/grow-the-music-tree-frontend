import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { RegionMapControls } from "./RegionMapControls";

const mount = (props: Partial<React.ComponentProps<typeof RegionMapControls>> = {}) => {
  const handlers = { onZoomIn: vi.fn(), onZoomOut: vi.fn(), onFit: vi.fn() };
  render(
    <RegionMapControls canZoomIn canZoomOut {...handlers} {...props} />,
  );
  return handlers;
};

afterEach(cleanup);

describe("RegionMapControls", () => {
  it("only offers zoom controls, with no separate night mode button", () => {
    mount();
    expect(screen.queryByRole("button", { name: "Night mode" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("calls the zoom and fit handlers", () => {
    const { onZoomIn, onZoomOut, onFit } = mount();
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    fireEvent.click(screen.getByRole("button", { name: "Zoom out" }));
    fireEvent.click(screen.getByRole("button", { name: "Fit to frame" }));
    expect(onZoomIn).toHaveBeenCalledTimes(1);
    expect(onZoomOut).toHaveBeenCalledTimes(1);
    expect(onFit).toHaveBeenCalledTimes(1);
  });

  it("disables a zoom direction at its limit but keeps fit available", () => {
    mount({ canZoomIn: false, canZoomOut: false });
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Fit to frame" })).toBeEnabled();
  });
});
