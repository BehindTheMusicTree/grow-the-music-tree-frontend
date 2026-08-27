import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PrototypeModeBanner from "./PrototypeModeBanner";

describe("PrototypeModeBanner", () => {
  it("renders a persistent demo-mode status message", () => {
    render(<PrototypeModeBanner />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "You're viewing the prototype demo tree — browsing only, changes aren't saved.",
    );
  });
});
