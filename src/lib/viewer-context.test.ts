import { afterEach, describe, expect, it, vi } from "vitest";
import { viewerContextHeaders } from "./viewer-context";

afterEach(() => vi.unstubAllEnvs());

describe("viewer context trust", () => {
  it("ignores forged visitor/internal headers without edge authentication", () => {
    vi.stubEnv("EDGE_VIEWER_CONTEXT_TOKEN", "edge-secret");
    vi.stubEnv("VIEWER_CONTEXT_TOKEN", "api-secret");
    expect(viewerContextHeaders(new Headers({ "cf-ipcountry": "FR", "x-viewer-country": "AL", "x-viewer-context-token": "forged" })))
      .toEqual({ "X-Viewer-Context-Token": "api-secret" });
  });

  it.each(["FR", "AL"])("forwards verified %s using the independent API credential", (country) => {
    vi.stubEnv("EDGE_VIEWER_CONTEXT_TOKEN", "edge-secret");
    vi.stubEnv("VIEWER_CONTEXT_TOKEN", "api-secret");
    expect(viewerContextHeaders(new Headers({ "cf-ipcountry": country, "x-btmt-edge-token": "edge-secret" })))
      .toEqual({ "X-Viewer-Context-Token": "api-secret", "X-Viewer-Country": country });
  });

  it.each(["XX", "T1", "fr", "", "FR,AL"])("leaves invalid country %s unknown", (country) => {
    vi.stubEnv("EDGE_VIEWER_CONTEXT_TOKEN", "edge-secret");
    vi.stubEnv("VIEWER_CONTEXT_TOKEN", "api-secret");
    expect(viewerContextHeaders(new Headers({ "cf-ipcountry": country, "x-btmt-edge-token": "edge-secret" }))["X-Viewer-Country"]).toBeUndefined();
  });

  it("fails when only one credential is configured", () => {
    vi.stubEnv("EDGE_VIEWER_CONTEXT_TOKEN", "edge-secret");
    vi.stubEnv("VIEWER_CONTEXT_TOKEN", "");
    expect(() => viewerContextHeaders(new Headers())).toThrow("Both viewer context tokens");
  });
});
