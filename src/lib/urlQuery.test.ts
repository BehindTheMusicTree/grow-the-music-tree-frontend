import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { updateUrlQuery } from "./urlQuery";

const flush = () => new Promise<void>((resolve) => queueMicrotask(resolve));

describe("updateUrlQuery", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/map?keep=1");
    vi.spyOn(window.history, "pushState");
    vi.spyOn(window.history, "replaceState");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("builds each write on the current URL, so a later write never undoes an earlier one", async () => {
    updateUrlQuery((params) => params.set("genre", "pop"), "push");
    await flush();
    updateUrlQuery((params) => params.set("view", "1,2,3"), "replace");
    await flush();

    expect(window.location.pathname).toBe("/map");
    expect(new URLSearchParams(window.location.search).get("keep")).toBe("1");
    expect(new URLSearchParams(window.location.search).get("genre")).toBe("pop");
    expect(new URLSearchParams(window.location.search).get("view")).toBe("1,2,3");
  });

  it("applies writes of the same tick as one entry, pushed if any write pushes", async () => {
    updateUrlQuery((params) => params.delete("keep"), "replace");
    updateUrlQuery((params) => params.set("artist", "band"), "push");
    await flush();

    expect(window.history.pushState).toHaveBeenCalledTimes(1);
    expect(window.history.pushState).toHaveBeenCalledWith(null, "", "/map?artist=band");
    expect(window.history.replaceState).not.toHaveBeenCalled();
  });

  it("writes nothing when the URL does not change", async () => {
    window.history.replaceState(null, "", "/map?view=1,2,3");
    vi.mocked(window.history.replaceState).mockClear();

    updateUrlQuery((params) => params.set("view", "1,2,3"), "push");
    await flush();

    expect(window.history.pushState).not.toHaveBeenCalled();
    expect(window.history.replaceState).not.toHaveBeenCalled();
  });
});
