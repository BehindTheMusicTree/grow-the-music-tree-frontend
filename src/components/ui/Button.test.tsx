import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button Component", () => {
  it("renders children correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("applies default variant styles", () => {
    render(<Button>Default Button</Button>);
    const button = screen.getByText("Default Button");
    expect(button).toHaveClass("bg-black", "text-white");
  });

  it("applies outline variant styles", () => {
    render(<Button variant="outline">Outline Button</Button>);
    const button = screen.getByText("Outline Button");
    expect(button).toHaveClass("border", "border-gray-300");
  });

  it("applies danger variant styles", () => {
    render(<Button variant="danger">Delete</Button>);
    const button = screen.getByText("Delete");
    expect(button).toHaveClass("bg-red-600", "text-white");
  });

  it("applies secondary variant styles", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByText("Secondary");
    expect(button).toHaveClass("bg-gray-200", "text-gray-700");
  });

  it("applies small size styles", () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByText("Small");
    expect(button).toHaveClass("px-2", "py-1", "text-sm");
  });

  it("applies large size styles", () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByText("Large");
    expect(button).toHaveClass("px-6", "py-3", "text-lg");
  });

  it("applies icon size styles", () => {
    render(<Button size="icon">🔍</Button>);
    const button = screen.getByText("🔍");
    expect(button).toHaveClass("p-2");
  });

  it("merges custom className with default styles", () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByText("Custom");
    expect(button).toHaveClass("custom-class");
    expect(button).toHaveClass("bg-black"); // default variant
  });

  it("passes through HTML button attributes", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText("Disabled");
    expect(button).toBeDisabled();
  });

  it("handles onClick event", () => {
    let clicked = false;
    render(
      <Button
        onClick={() => {
          clicked = true;
        }}
      >
        Click
      </Button>
    );
    const button = screen.getByText("Click");
    button.click();
    expect(clicked).toBe(true);
  });

  it("renders as a button element", () => {
    render(<Button>Test</Button>);
    const button = screen.getByText("Test");
    expect(button.tagName).toBe("BUTTON");
  });
});
