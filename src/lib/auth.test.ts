import { beforeEach, describe, expect, it, vi } from "vitest";

const UPSTREAM = "https://grow-api.example.org/v1/";
const FUTURE = Math.floor(Date.now() / 1000) + 3600;

const { getToken, captured } = vi.hoisted(() => ({
  getToken: vi.fn(),
  captured: { config: undefined as undefined | (() => { callbacks: Record<string, (...a: never[]) => unknown> }) },
}));

vi.mock("server-only", () => ({}));
vi.mock("next-auth", () => ({
  default: (config: typeof captured.config) => {
    captured.config = config;
    return { handlers: {}, auth: vi.fn(), signIn: vi.fn(), signOut: vi.fn() };
  },
}));
vi.mock("next-auth/providers/google", () => ({ default: () => ({}) }));
vi.mock("next-auth/jwt", () => ({ getToken }));
vi.mock("@lib/env.server", () => ({
  getServerEnv: () => ({
    GROW_API_ORIGIN: "https://grow-api.example.org",
    AUTH_SECRET: "s",
    AUTH_GOOGLE_ID: "id",
    AUTH_GOOGLE_SECRET: "secret",
  }),
}));

import { getAdminIdToken } from "@lib/auth";

type JwtCallback = (args: { token: Record<string, unknown>; account?: Record<string, unknown> }) => Promise<Record<string, unknown>>;
const jwt = () => captured.config!().callbacks.jwt as unknown as JwtCallback;
const request = { headers: new Headers() };

beforeEach(() => getToken.mockReset());

describe("jwt callback", () => {
  it("records the current upstream at sign-in", async () => {
    const result = await jwt()({
      token: {},
      account: { id_token: "tok", refresh_token: "r", expires_at: FUTURE },
    });
    expect(result).toMatchObject({ idToken: "tok", upstream: UPSTREAM });
    expect(result.error).toBeUndefined();
  });

  it("keeps a valid, unexpired token bound to the current upstream", async () => {
    const token = { idToken: "tok", expiresAt: FUTURE, upstream: UPSTREAM };
    expect(await jwt()({ token })).toEqual(token);
  });

  it.each([
    ["a different upstream", "http://localhost:8000/v1/"],
    ["no recorded upstream (legacy cookie)", undefined],
  ])("flags UpstreamChanged for %s, even when the token is unexpired", async (_label, upstream) => {
    const result = await jwt()({ token: { idToken: "tok", expiresAt: FUTURE, upstream } });
    expect(result.error).toBe("UpstreamChanged");
  });
});

describe("getAdminIdToken", () => {
  it("returns the ID token when bound to the current upstream", async () => {
    getToken.mockResolvedValue({ idToken: "tok", expiresAt: FUTURE, upstream: UPSTREAM });
    expect(await getAdminIdToken(request)).toBe("tok");
  });

  it.each([["http://localhost:8000/v1/"], [undefined]])("returns null when upstream is %s", async (upstream) => {
    getToken.mockResolvedValue({ idToken: "tok", expiresAt: FUTURE, upstream });
    expect(await getAdminIdToken(request)).toBeNull();
  });
});
