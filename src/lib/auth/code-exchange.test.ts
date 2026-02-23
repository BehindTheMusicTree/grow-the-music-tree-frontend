import { describe, it, expect, beforeEach } from "vitest";
import {
  clearStoredRedirectUrl,
  storeRedirectUrl,
  GOOGLE_EXCHANGE_CONFIG,
  SPOTIFY_EXCHANGE_CONFIG,
} from "./code-exchange";

describe("code-exchange auth helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("clearStoredRedirectUrl", () => {
    it("removes the stored redirect URL for the given key", () => {
      const key = "testRedirectKey";
      localStorage.setItem(key, "https://example.com/after-auth");
      expect(localStorage.getItem(key)).toBe("https://example.com/after-auth");

      clearStoredRedirectUrl(key);

      expect(localStorage.getItem(key)).toBeNull();
    });

    it("clears googleAuthRedirect key used by Google callback", () => {
      const key = GOOGLE_EXCHANGE_CONFIG.redirectStorageKey;
      localStorage.setItem(key, "https://app.example.com/dashboard");
      clearStoredRedirectUrl(key);
      expect(localStorage.getItem(key)).toBeNull();
    });

    it("clears spotifyAuthRedirect key used by Spotify callback", () => {
      const key = SPOTIFY_EXCHANGE_CONFIG.redirectStorageKey;
      localStorage.setItem(key, "https://app.example.com/playlists");
      clearStoredRedirectUrl(key);
      expect(localStorage.getItem(key)).toBeNull();
    });

    it("is idempotent when key is missing", () => {
      clearStoredRedirectUrl("nonexistentKey");
      expect(localStorage.getItem("nonexistentKey")).toBeNull();
    });
  });

  describe("storeRedirectUrl and clearStoredRedirectUrl", () => {
    it("stored redirect is cleared by clearStoredRedirectUrl so next auth redirects to default", () => {
      const key = GOOGLE_EXCHANGE_CONFIG.redirectStorageKey;
      storeRedirectUrl(key, "/some-page");
      expect(localStorage.getItem(key)).toBeTruthy();

      clearStoredRedirectUrl(key);

      expect(localStorage.getItem(key)).toBeNull();
    });
  });
});
