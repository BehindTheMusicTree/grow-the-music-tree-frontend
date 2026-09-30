import "@testing-library/jest-dom/vitest";
import { beforeEach, vi } from "vitest";

// Unit/component tests run without React Strict Mode (single render, deterministic counts).
// See docs/testing.md § React Strict Mode.

beforeEach(() => {
  // Node's experimental global localStorage shadows happy-dom's and is undefined without --localstorage-file.
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
  });
});
