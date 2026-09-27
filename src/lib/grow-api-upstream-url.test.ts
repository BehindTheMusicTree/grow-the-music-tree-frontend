import { describe, expect, it, vi } from "vitest";
import { getGrowApiUpstreamBaseUrl } from "@lib/grow-api-upstream-url";

vi.mock("@lib/env.server", () => ({ getServerEnv: () => ({ GROW_API_ORIGIN: "https://grow-api.example.org" }) }));

describe("getGrowApiUpstreamBaseUrl", () => {
  it("appends the pinned API contract version to the configured origin", () => {
    expect(getGrowApiUpstreamBaseUrl()).toBe("https://grow-api.example.org/v1/");
  });
});
