import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("env", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("parses public env and applies Sentry sample rate defaults", async () => {
    vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", "contact@example.com");
    const { publicEnv } = await import("@lib/env");
    expect(publicEnv.NEXT_PUBLIC_CONTACT_EMAIL).toBe("contact@example.com");
    expect(publicEnv.NEXT_PUBLIC_SENTRY_REPLAY_ON_ERROR_SAMPLE_RATE).toBe(1);
  });

  it("throws when NEXT_PUBLIC_CONTACT_EMAIL is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", "");
    await expect(import("@lib/env")).rejects.toThrow(/NEXT_PUBLIC_CONTACT_EMAIL/);
  });

  it("parses server env when all required vars are set", async () => {
    vi.stubEnv("AUTH_SECRET", "secret");
    vi.stubEnv("AUTH_GOOGLE_ID", "id");
    vi.stubEnv("AUTH_GOOGLE_SECRET", "google-secret");
    vi.stubEnv("GROW_API_ORIGIN", "https://grow-api.example.org/");
    const { getServerEnv } = await import("@lib/env.server");
    expect(getServerEnv().GROW_API_ORIGIN).toBe("https://grow-api.example.org");
  });

  it("rejects a GROW_API_ORIGIN that carries a path", async () => {
    vi.stubEnv("AUTH_SECRET", "secret");
    vi.stubEnv("AUTH_GOOGLE_ID", "id");
    vi.stubEnv("AUTH_GOOGLE_SECRET", "google-secret");
    vi.stubEnv("GROW_API_ORIGIN", "https://grow-api.example.org/v1/");
    const { getServerEnv } = await import("@lib/env.server");
    expect(() => getServerEnv()).toThrow(/GROW_API_ORIGIN/);
  });

  it("throws naming every missing server var", async () => {
    vi.stubEnv("AUTH_SECRET", "");
    vi.stubEnv("AUTH_GOOGLE_ID", "");
    vi.stubEnv("AUTH_GOOGLE_SECRET", "");
    vi.stubEnv("GROW_API_ORIGIN", "");
    const { getServerEnv } = await import("@lib/env.server");
    expect(() => getServerEnv()).toThrow(/AUTH_SECRET[\s\S]*GROW_API_ORIGIN/);
  });
});
