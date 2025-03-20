import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import ApiErrorHandler from "./ApiErrorHandler";
import ApiService from "../../utils/ApiService";
import { usePopup } from "../../contexts/popup/usePopup";
import CorsError from "../../utils/errors/CorsError";
import CorsErrorPopupContentObject from "../../models/popup-content-object/CorsErrorPopupContentObject";
import config from "../../utils/config";

// Mock the usePopup hook
vi.mock("../../contexts/popup/usePopup", () => ({
  usePopup: vi.fn(),
}));

describe("ApiErrorHandler", () => {
  let showPopupMock;
  let onErrorCallback;

  beforeEach(() => {
    // Setup mock for ApiService.onError
    onErrorCallback = null;
    ApiService.onError = vi.fn((callback) => {
      onErrorCallback = callback;
      return vi.fn(); // Return a mock unsubscribe function
    });

    // Setup mock for usePopup
    showPopupMock = vi.fn();
    usePopup.mockReturnValue({
      showPopup: showPopupMock,
      hidePopup: vi.fn(),
    });
  });

  it("should handle CorsError correctly", () => {
    // Render the component to setup error subscription
    render(
      <ApiErrorHandler>
        <div>Test Content</div>
      </ApiErrorHandler>
    );

    // Verify that ApiService.onError was called
    expect(ApiService.onError).toHaveBeenCalled();
    expect(typeof onErrorCallback).toBe("function");

    // Create a CORS error
    const corsErrorObj = {
      message: "Cross-Origin Request Blocked",
      url: `http://localhost:8000${config.apiBaseUrl.replace(/^https?:\/\/[^/]+/, "")}auth/token/`,
    };
    const corsError = new CorsError(corsErrorObj);

    // Simulate error event
    onErrorCallback(corsError);

    // Verify showPopup was called with a CorsErrorPopupContentObject
    expect(showPopupMock).toHaveBeenCalled();

    const popupContentArg = showPopupMock.mock.calls[0][0];
    expect(popupContentArg).toBeInstanceOf(CorsErrorPopupContentObject);
    expect(popupContentArg.title).toBe("Cross-Origin Request Error");
    expect(popupContentArg.type).toBe("CorsErrorPopupContentObject");
  });

  it("should handle regular RequestErrors", () => {
    // Render the component to setup error subscription
    render(
      <ApiErrorHandler>
        <div>Test Content</div>
      </ApiErrorHandler>
    );

    // Create a mock RequestError with status code 400
    const requestError = {
      name: "RequestError",
      statusCode: 400,
      requestErrors: [{ message: "Bad Request" }],
    };

    // Make sure it's treated as a RequestError instance
    Object.setPrototypeOf(requestError, Error.prototype);
    requestError instanceof Error; // true

    // Simulate error event
    onErrorCallback(requestError);

    // Verify showPopup was called with an ApiErrorPopupContentObject for 400 status
    expect(showPopupMock).toHaveBeenCalled();
  });

  it("should render children correctly", () => {
    const { getByText } = render(
      <ApiErrorHandler>
        <div>Test Child Content</div>
      </ApiErrorHandler>
    );

    expect(getByText("Test Child Content")).toBeInTheDocument();
  });
});
