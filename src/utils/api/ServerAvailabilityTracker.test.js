import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ServerAvailabilityTracker from "./ServerAvailabilityTracker";
import ConnectivityError from "./errors/ConnectivityError";

describe("ServerAvailabilityTracker", () => {
  let tracker;

  beforeEach(() => {
    vi.useFakeTimers();
    tracker = new ServerAvailabilityTracker();
    console.log = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should notify on first 404 error", () => {
    const error = { statusCode: 404 };
    const shouldNotify = tracker.recordError(error, "/api/endpoint1");
    expect(shouldNotify).toBe(true);
  });

  it("should notify on first 500 error", () => {
    const error = { statusCode: 500 };
    const shouldNotify = tracker.recordError(error, "/api/endpoint1");
    expect(shouldNotify).toBe(true);
  });

  it("should notify on 502, 503, and 504 errors", () => {
    const error502 = { statusCode: 502 };
    const error503 = { statusCode: 503 };
    const error504 = { statusCode: 504 };

    // Reset after each test to avoid cooldown affecting the next test
    expect(tracker.recordError(error502, "/api/endpoint1")).toBe(true);
    tracker.lastServerDownNotification = 0;

    expect(tracker.recordError(error503, "/api/endpoint2")).toBe(true);
    tracker.lastServerDownNotification = 0;

    expect(tracker.recordError(error504, "/api/endpoint3")).toBe(true);
  });

  it("should not notify on non-connectivity errors", () => {
    const error = { statusCode: 400 }; // Bad request
    const shouldNotify = tracker.recordError(error, "/api/endpoint1");
    expect(shouldNotify).toBe(false);
  });

  it("should detect network errors (TypeError)", () => {
    const networkError = { name: "TypeError", message: "Failed to fetch" };
    const shouldNotify = tracker.recordError(networkError, "/api/endpoint1");
    expect(shouldNotify).toBe(true);
  });

  it("should create appropriate server down error", () => {
    const serverDownError = tracker.createServerDownError("/api/test");
    expect(serverDownError).toBeInstanceOf(ConnectivityError);
    expect(serverDownError.connectivityType).toBe("server_not_found");

    // The message is a stringified JSON object, so we need to parse it
    const messageParsed = JSON.parse(serverDownError.message);
    expect(messageParsed.message).toBe("Server appears to be down or unreachable");
    expect(messageParsed.details.message).toBe("The server appears to be unavailable or unreachable.");

    // Log the error object to console for debugging
    console.error("Connectivity Error Details:", serverDownError);
  });

  it("should not notify again within cooldown period", () => {
    // First error - should notify
    const error = { statusCode: 404 };
    const firstNotify = tracker.recordError(error, "/api/endpoint1");
    expect(firstNotify).toBe(true);

    // Second error immediately after - should not notify (in cooldown)
    const secondNotify = tracker.recordError(error, "/api/endpoint2");
    expect(secondNotify).toBe(false);

    // Advance time past cooldown period (30 seconds)
    vi.advanceTimersByTime(31000);

    // Another error after cooldown - should notify again
    const thirdNotify = tracker.recordError(error, "/api/endpoint3");
    expect(thirdNotify).toBe(true);
  });

  it("should respect cooldown for different types of errors", () => {
    // 404 error - should notify
    const notFound = { statusCode: 404 };
    const firstNotify = tracker.recordError(notFound, "/api/endpoint1");
    expect(firstNotify).toBe(true);

    // 500 error immediately after - should not notify (in cooldown)
    const serverError = { statusCode: 500 };
    const secondNotify = tracker.recordError(serverError, "/api/endpoint2");
    expect(secondNotify).toBe(false);
  });
});
