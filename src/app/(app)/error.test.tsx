import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ErrorCode } from "@behindthemusictree/app-kit/transport";
import AppError from "./error";

const captureException = vi.fn();
vi.mock("@sentry/nextjs", () => ({ captureException: (...args: unknown[]) => captureException(...args) }));

afterEach(cleanup);

describe("AppError", () => {
  it("shows the shared internal error popup without leaking the internal error text", () => {
    render(<AppError error={new Error('Cannot show "pop-core" view: no Mainstream Pop root')} reset={vi.fn()} />);

    expect(screen.getByText(`Error Code: ${ErrorCode.CLIENT_INTERNAL_ERROR}`)).toBeInTheDocument();
    expect(screen.queryByText(/mainstream pop/i)).not.toBeInTheDocument();
  });

  it("reports the error to Sentry", () => {
    const error = new Error("boom");
    render(<AppError error={error} reset={vi.fn()} />);

    expect(captureException).toHaveBeenCalledWith(error);
  });
});
