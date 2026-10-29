import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import AdminPage from "./page";

vi.mock("@lib/auth", () => ({ auth: async () => null, signIn: vi.fn(), signOut: vi.fn() }));
vi.mock("@lib/genre-name-conflicts", () => ({ fetchGenreNameConflictGroups: vi.fn() }));
vi.mock("@lib/genre-unaccepted-roots", () => ({ fetchUnacceptedRoots: vi.fn() }));
vi.mock("@components/ui/Page", () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));

describe("AdminPage signed out", () => {
  afterEach(cleanup);

  it("explains an AccessDenied sign-in", async () => {
    render(await AdminPage({ searchParams: Promise.resolve({ error: "AccessDenied" }) }));

    expect(screen.getByRole("alert")).toHaveTextContent("Only admin accounts can");
  });

  it("shows no alert without an error", async () => {
    render(await AdminPage({ searchParams: Promise.resolve({}) }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
