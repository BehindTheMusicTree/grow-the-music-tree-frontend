import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CorsErrorPopupChild from "./CorsErrorPopupChild";
import CorsErrorPopupContentObject from "../../../models/popup-content-object/CorsErrorPopupContentObject";

describe("CorsErrorPopupChild", () => {
  it("should render error messages with correct styling", () => {
    // Create sample CORS error data
    const corsErrorObj = {
      message: "Cross-Origin Request Blocked",
      url: "http://localhost:8000/api/v0.1.1/auth/token/",
    };

    // Create popup content object
    const popupContentObject = new CorsErrorPopupContentObject(corsErrorObj);

    // Render the component
    const { container } = render(<CorsErrorPopupChild popupContentObject={popupContentObject} />);

    // Check that the main error message is rendered with red styling
    const mainErrorElement = screen.getByText("❌ Cross-Origin Request Blocked");
    expect(mainErrorElement).toBeInTheDocument();
    expect(mainErrorElement.className).toContain("text-red-500");

    // Check that the error details are rendered
    const detailsHeading = screen.getByText("Details");
    expect(detailsHeading).toBeInTheDocument();

    // Check that the URL is displayed
    const urlElement = screen.getByText(/http:\/\/localhost:8000\/api\/v0.1.1\/auth\/token\//);
    expect(urlElement).toBeInTheDocument();

    // Check that "Possible Solutions" section is rendered
    const solutionsHeading = screen.getByText("Possible Solutions");
    expect(solutionsHeading).toBeInTheDocument();

    // Verify the warning symbols are used for non-Error sections
    const warningElements = container.querySelectorAll(".text-orange-500");
    expect(warningElements.length).toBeGreaterThan(0);

    // Verify all operation errors are rendered
    expect(screen.getAllByRole("listitem").length).toBe(
      popupContentObject.operationErrors.reduce((total, section) => total + section.errors.length, 0)
    );
  });

  it("should handle popup content with minimal information", () => {
    // Create sample minimal CORS error data
    const corsErrorObj = {
      message: "Cross-Origin Request Blocked",
    };

    // Create popup content object
    const popupContentObject = new CorsErrorPopupContentObject(corsErrorObj);

    // Render the component
    render(<CorsErrorPopupChild popupContentObject={popupContentObject} />);

    // Check that the main error message is rendered
    expect(screen.getByText("❌ Cross-Origin Request Blocked")).toBeInTheDocument();

    // Check that "Unknown URL" is displayed when no URL is provided
    expect(screen.getByText(/Unknown URL/)).toBeInTheDocument();
  });
});
