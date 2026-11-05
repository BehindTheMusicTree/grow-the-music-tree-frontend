import { describe, expect, it, vi } from "vitest";
import { collapseEdgeTab } from "./collapseEdgeTab";

describe("collapseEdgeTab", () => {
  it("offers to hide an open panel", () => {
    const onChange = vi.fn();
    const tab = collapseEdgeTab(false, onChange);

    expect(tab.center).toBeNull();
    tab.edge?.onClick();
    expect(tab.edge?.label).toBe("Hide panel");
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("offers to show a collapsed panel", () => {
    const onChange = vi.fn();
    const tab = collapseEdgeTab(true, onChange);

    expect(tab.edge).toBeNull();
    tab.center?.onClick();
    expect(tab.center?.label).toBe("Show panel");
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
