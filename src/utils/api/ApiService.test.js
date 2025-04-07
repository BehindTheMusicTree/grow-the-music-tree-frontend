import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ApiService from "./ApiService";
import ConnectivityError from "../errors/ConnectivityError";
import ConnectivityErrorPopupContentObject from "../../models/popup-content-object/ConnectivityErrorPopupContentObject";
import config from "../config";

describe("ApiService connectivity error handling", () => {
  let errorSubscriberMock;
  let originalErrorSubscribers;

  beforeEach(() => {
    errorSubscriberMock = vi.fn();
    originalErrorSubscribers = [...ApiService.errorSubscribers];
    ApiService.errorSubscribers = [];
    ApiService.onError(errorSubscriberMock);

    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    };
  });

  afterEach(() => {
    ApiService.errorSubscribers = originalErrorSubscribers;
    vi.restoreAllMocks();
  });

  describe("isConnectivityError", () => {
    it('should identify connectivity error from error message containing "cors"', () => {
      const error = new TypeError("Failed to fetch due to CORS policy");
      expect(ApiService.isConnectivityError(error)).toBe(true);
    });

    it('should identify connectivity error from error message containing "cross-origin"', () => {
      const error = new TypeError("Cross-Origin Request Blocked");
      expect(ApiService.isConnectivityError(error)).toBe(true);
    });

    it('should identify connectivity error from error message containing "access-control-allow-origin"', () => {
      const error = new TypeError("No Access-Control-Allow-Origin header is present");
      expect(ApiService.isConnectivityError(error)).toBe(true);
    });

    it("should identify connectivity error from TypeError with network error", () => {
      const error = new TypeError("Failed to fetch");
      expect(ApiService.isConnectivityError(error)).toBe(true);
    });

    it("should not identify non-connectivity errors", () => {
      const error = new Error("Regular error");
      expect(ApiService.isConnectivityError(error)).toBe(false);
    });
  });

  describe("getFetchErrorMessageOtherThanBadRequest", () => {
    it("should throw ConnectivityError for connectivity issues", () => {
      const error = new TypeError("Cross-Origin Request Blocked");
      const url = `http://localhost:8000${config.apiBaseUrl.replace(/^https?:\/\/[^/]+/, "")}auth/token/`;

      expect(() => {
        ApiService.getFetchErrorMessageOtherThanBadRequest(error, url);
      }).toThrow(ConnectivityError);
    });

    it("should return error message for other errors", () => {
      const error = new Error("Regular error");
      const result = ApiService.getFetchErrorMessageOtherThanBadRequest(error, "http://example.com");
      expect(result).toBe("Regular error");
    });
  });

  describe("login method connectivity error handling", () => {
    it("should notify error subscribers on connectivity error", async () => {
      // Mock fetch to simulate CORS error
      global.fetch = vi.fn().mockImplementation(() => {
        throw new TypeError("Cross-Origin Request Blocked");
      });

      try {
        await ApiService.login();
      } catch (error) {
        // We expect login to throw, but we want to verify the error subscriber was called
      }

      // Verify error subscriber was called with a ConnectivityError
      expect(errorSubscriberMock).toHaveBeenCalled();
      expect(errorSubscriberMock.mock.calls[0][0]).toBeInstanceOf(ConnectivityError);
    });
  });

  describe("fetchData method connectivity error handling", () => {
    it("should handle XMLHttpRequest connectivity errors (status 0)", async () => {
      // Mock XMLHttpRequest
      const mockXHR = {
        open: vi.fn(),
        send: vi.fn(),
        setRequestHeader: vi.fn(),
        status: 0,
        onload: null,
        onerror: null,
        upload: { onprogress: null },
      };

      global.XMLHttpRequest = vi.fn(() => mockXHR);

      // Mock getHeaders to avoid actual token handling
      ApiService.getHeaders = vi.fn().mockResolvedValue({});

      const fetchPromise = ApiService.fetchData("test-endpoint", "GET");

      // Trigger onerror to simulate CORS error
      mockXHR.onerror();

      try {
        await fetchPromise;
      } catch (error) {
        // Expected to throw
      }

      // Verify error subscriber was called with a ConnectivityError
      expect(errorSubscriberMock).toHaveBeenCalled();
      expect(errorSubscriberMock.mock.calls[0][0]).toBeInstanceOf(ConnectivityError);
    });
  });

  describe("ConnectivityError and popup content integration", () => {
    it("should create appropriate ConnectivityErrorPopupContentObject from ConnectivityError", () => {
      const connectivityErrorObj = {
        message: "Cross-Origin Request Blocked",
        url: `http://localhost:8000${config.apiBaseUrl.replace(/^https?:\/\/[^/]+/, "")}auth/token/`,
        details: {
          type: "cors_error",
        },
      };

      const connectivityError = new ConnectivityError(connectivityErrorObj);
      const popupContent = new ConnectivityErrorPopupContentObject(connectivityError.requestErrors[0]);

      expect(popupContent.title).toBe("API Connectivity Error");
      expect(popupContent.type).toBe("ConnectivityErrorPopupContentObject");
      expect(popupContent.operationErrors.length).toBeGreaterThan(0);

      // Verify first error is the main message
      expect(popupContent.operationErrors[0].name).toBe("Error");
      expect(popupContent.operationErrors[0].errors[0]).toBe("Connection Access Restricted");

      // Verify details section contains the URL
      expect(popupContent.operationErrors[1].name).toBe("Details");
      const expectedUrl = `http://localhost:8000${config.apiBaseUrl.replace(/^https?:\/\/[^/]+/, "")}auth/token/`;
      expect(popupContent.operationErrors[1].errors[1]).toContain(expectedUrl);
    });
  });
});
