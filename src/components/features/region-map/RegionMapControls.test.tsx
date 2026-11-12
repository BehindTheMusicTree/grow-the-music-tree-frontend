import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NightModeProvider } from "@contexts/NightModeProvider";
import { RegionMapControls } from "./RegionMapControls";

const mount = (props: Partial<React.ComponentProps<typeof RegionMapControls>> = {}) => {
  const handlers = { onZoomIn: vi.fn(), onZoomOut: vi.fn(), onFit: vi.fn() };
  render(
    <NightModeProvider>
      <RegionMapControls canZoomIn canZoomOut {...handlers} {...props} />
    </NightModeProvider>,
  );
  return handlers;
};

afterEach(cleanup);

describe("RegionMapControls", () => {
  it("toggles night mode, off by default", () => {
    mount();
    const button = screen.getByRole("button", { name: "Night mode" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-pressed", "false");
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
