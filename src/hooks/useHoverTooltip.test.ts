import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useHoverTooltip } from "./useHoverTooltip";

describe("useHoverTooltip", () => {
  it("re-renders only when the text changes, not when the pointer moves", () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;
      return useHoverTooltip();
    });

    act(() => result.current.show(1, 2, "Rock"));
    // React may re-render once more before it settles on a repeated value.
    act(() => result.current.show(5, 5, "Rock"));
    const afterFirst = renders;
    act(() => result.current.show(10, 20, "Rock"));
    act(() => result.current.show(30, 40, "Rock"));

    expect(renders).toBe(afterFirst);
    expect(result.current.text).toBe("Rock");
  });

  it("positions the element directly, including when it mounts after the first show", () => {
    const { result } = renderHook(() => useHoverTooltip());
    const node = document.createElement("div");

    act(() => result.current.show(5, 6, "Jazz"));
    act(() => result.current.ref(node));
    expect(node.style.left).toBe("5px");
    expect(node.style.top).toBe("6px");

    act(() => result.current.show(7, 8, "Jazz"));
    expect(node.style.left).toBe("7px");
    expect(node.style.top).toBe("8px");
  });

  it("clears the text on hide", () => {
    const { result } = renderHook(() => useHoverTooltip());
    act(() => result.current.show(0, 0, "Blues"));
    act(() => result.current.hide());
    expect(result.current.text).toBeNull();
  });
});
