import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Analytics from "@components/features/analytics/Analytics";
import { ANALYTICS_OPT_OUT_KEY } from "@lib/analytics";

const mocks = vi.hoisted(() => ({ isAdmin: false, websiteId: undefined as string | undefined }));

vi.mock("@hooks/useIsAdmin", () => ({ useIsAdmin: () => mocks.isAdmin }));
vi.mock("@lib/env", () => ({
  publicEnv: {
    get NEXT_PUBLIC_UMAMI_WEBSITE_ID() {
      return mocks.websiteId;
    },
  },
}));
vi.mock("next/script", () => ({
  default: (props: Record<string, string>) => <div data-testid="umami-script" data-src={props.src} />,
}));

describe("Analytics", () => {
  beforeEach(() => {
    mocks.isAdmin = false;
    mocks.websiteId = undefined;
  });

  it("renders no script without a website id", () => {
    render(<Analytics />);
    expect(screen.queryByTestId("umami-script")).toBeNull();
  });

  it("loads the proxied script when a website id is set", () => {
    mocks.websiteId = "6f1c7a4e-9d0b-4c53-8a2e-1b7d3f5a9c10";
    render(<Analytics />);
    expect(screen.getByTestId("umami-script").getAttribute("data-src")).toBe("/stats/script.js");
  });

  it("opts admins out of tracking", () => {
    mocks.isAdmin = true;
    render(<Analytics />);
    expect(localStorage.getItem(ANALYTICS_OPT_OUT_KEY)).toBe("1");
  });
});
