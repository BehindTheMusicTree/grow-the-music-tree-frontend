import { vi } from "vitest";
import "@testing-library/jest-dom";

// Mock localStorage for tests
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
