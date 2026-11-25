import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { NightModeProvider, useNightMode } from "./NightModeProvider";

function Probe() {
  const { nightMode, toggleNightMode } = useNightMode();
  return (
    <div>
      <span data-testid="night-mode">{String(nightMode)}</span>
      <button onClick={toggleNightMode}>toggle</button>
    </div>
  );
}

describe("NightModeProvider", () => {
  afterEach(() => {
    cleanup();
  });

  it("defaults to off and toggles", () => {
    render(
      <NightModeProvider>
        <Probe />
      </NightModeProvider>,
    );
    expect(screen.getByTestId("night-mode")).toHaveTextContent("false");

    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("night-mode")).toHaveTextContent("true");
  });

  it("throws outside the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow("useNightMode must be used within a NightModeProvider");
  });
});
