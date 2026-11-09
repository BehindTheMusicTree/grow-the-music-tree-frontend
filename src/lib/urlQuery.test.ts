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
    updateUrlQuery((params) => params.set("genre", "pop"), "push", "/map");
    await flush();
    updateUrlQuery((params) => params.set("view", "1,2,3"), "replace", "/map");
    await flush();

    expect(window.location.pathname).toBe("/map");
    expect(new URLSearchParams(window.location.search).get("keep")).toBe("1");
    expect(new URLSearchParams(window.location.search).get("genre")).toBe("pop");
    expect(new URLSearchParams(window.location.search).get("view")).toBe("1,2,3");
  });

  it("applies writes of the same tick as one entry, pushed if any write pushes", async () => {
    updateUrlQuery((params) => params.delete("keep"), "replace", "/map");
    updateUrlQuery((params) => params.set("artist", "band"), "push", "/map");
    await flush();

    expect(window.history.pushState).toHaveBeenCalledTimes(1);
    expect(window.history.pushState).toHaveBeenCalledWith(null, "", "/map?artist=band");
    expect(window.history.replaceState).not.toHaveBeenCalled();
  });

  it("writes nothing when the URL does not change", async () => {
    window.history.replaceState(null, "", "/map?view=1,2,3");
    vi.mocked(window.history.replaceState).mockClear();

    updateUrlQuery((params) => params.set("view", "1,2,3"), "push", "/map");
    await flush();

    expect(window.history.pushState).not.toHaveBeenCalled();
    expect(window.history.replaceState).not.toHaveBeenCalled();
  });

  it("drops a write whose page has been left before the batch runs", async () => {
    updateUrlQuery((params) => params.set("at", "1,2,3"), "replace", "/map");
    window.history.pushState(null, "", "/?artist=band");
    vi.mocked(window.history.pushState).mockClear();
    await flush();

    expect(window.location.search).toBe("?artist=band");
    expect(window.history.replaceState).not.toHaveBeenCalled();
    expect(window.history.pushState).not.toHaveBeenCalled();
  });

  it("applies only the writes of the current page in a mixed batch, with their method", async () => {
    updateUrlQuery((params) => params.set("at", "1,2,3"), "push", "/map");
    updateUrlQuery((params) => params.set("view", "4,5,6"), "replace", "/");
    window.history.replaceState(null, "", "/?keep=1");
    vi.mocked(window.history.replaceState).mockClear();
    await flush();

    expect(window.history.replaceState).toHaveBeenCalledWith(null, "", "/?keep=1&view=4%2C5%2C6");
    expect(window.history.pushState).not.toHaveBeenCalled();
  });
});
