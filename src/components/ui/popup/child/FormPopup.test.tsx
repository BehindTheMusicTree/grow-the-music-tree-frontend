"use client";

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import FormPopup from "./FormPopup";

describe("FormPopup", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders its children", () => {
    render(
      <FormPopup onSubmit={vi.fn()} onCancel={vi.fn()}>
        <div>form content</div>
      </FormPopup>,
    );

    expect(screen.getByText("form content")).toBeInTheDocument();
  });

  it("calls onCancel when Cancel is clicked", () => {
    const onCancel = vi.fn();
    render(
      <FormPopup onSubmit={vi.fn()} onCancel={onCancel}>
        <div />
      </FormPopup>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onSubmit when the form is submitted", () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <FormPopup onSubmit={onSubmit} onCancel={vi.fn()}>
        <div />
      </FormPopup>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("uses custom submit and cancel button text when provided", () => {
    render(
      <FormPopup onSubmit={vi.fn()} onCancel={vi.fn()} submitText="Save" cancelText="Discard">
        <div />
      </FormPopup>,
    );

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Discard" })).toBeInTheDocument();
  });

  it("disables the submit button and shows 'Loading...' when loading", () => {
    render(
      <FormPopup onSubmit={vi.fn()} onCancel={vi.fn()} loading>
        <div />
      </FormPopup>,
    );

    const submitButton = screen.getByRole("button", { name: "Loading..." });
    expect(submitButton).toBeDisabled();
  });

  it("does not disable the submit button when not loading", () => {
    render(
      <FormPopup onSubmit={vi.fn()} onCancel={vi.fn()}>
        <div />
      </FormPopup>,
    );

    expect(screen.getByRole("button", { name: "Submit" })).not.toBeDisabled();
  });
});
