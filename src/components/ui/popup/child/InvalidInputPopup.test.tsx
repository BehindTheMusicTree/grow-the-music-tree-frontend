"use client";

import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import InvalidInputPopup from "./InvalidInputPopup";

describe("InvalidInputPopup", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the top-level message", () => {
    render(<InvalidInputPopup details={{ message: "Invalid input" }} />);

    expect(screen.getByText("Invalid input")).toBeInTheDocument();
  });

  it("renders field errors grouped by field name when provided", () => {
    render(
      <InvalidInputPopup
        details={{
          message: "Invalid input",
          fieldErrors: {
            name: [{ message: "Name is required", code: "required" }],
            email: [{ message: "Email is invalid", code: "invalid" }],
          },
        }}
      />,
    );

    expect(screen.getByText("name")).toBeInTheDocument();
    expect(screen.getByText("- Name is required")).toBeInTheDocument();
    expect(screen.getByText("email")).toBeInTheDocument();
    expect(screen.getByText("- Email is invalid")).toBeInTheDocument();
  });

  it("renders no field error section when fieldErrors is omitted", () => {
    render(<InvalidInputPopup details={{ message: "Invalid input" }} />);

    expect(screen.queryAllByRole("heading", { level: 4 })).toHaveLength(0);
  });
});
