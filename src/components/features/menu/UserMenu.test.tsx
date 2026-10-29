import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { UserMenu } from "./UserMenu";

const signIn = vi.fn();
const signOut = vi.fn();
let session: { user: { email?: string; name?: string } } | null = null;

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: session, status: session ? "authenticated" : "unauthenticated" }),
  signIn: (...args: unknown[]) => signIn(...args),
  signOut: (...args: unknown[]) => signOut(...args),
}));

describe("UserMenu", () => {
  afterEach(() => {
    cleanup();
    session = null;
    signIn.mockReset();
    signOut.mockReset();
  });

  it("starts Google sign-in when signed out", () => {
    render(<UserMenu />);

    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(signIn).toHaveBeenCalledWith("google", { redirectTo: "/admin" });
  });

  it("styles the sign-in button blue", () => {
    render(<UserMenu />);

    expect(screen.getByRole("button", { name: "Sign in" })).toHaveClass("bg-blue-600");
  });

  it("shows the initials of the account name", () => {
    session = { user: { name: "Jean Dupont", email: "admin@example.com" } };
    render(<UserMenu />);

    expect(screen.getByRole("button", { name: "Account" })).toHaveTextContent("JD");
  });

  it("falls back to the email initial", () => {
    session = { user: { email: "admin@example.com" } };
    render(<UserMenu />);

    expect(screen.getByRole("button", { name: "Account" })).toHaveTextContent("A");
  });

  it("lists the admin pages when signed in", () => {
    session = { user: { email: "admin@example.com" } };
    render(<UserMenu />);

    fireEvent.click(screen.getByRole("button", { name: "Account" }));
    expect(screen.getByRole("menuitem", { name: "Admin" })).toHaveAttribute("href", "/admin");
    expect(screen.getByRole("menuitem", { name: "Curation" })).toHaveAttribute("href", "/admin/curation");
    expect(screen.getByRole("menuitem", { name: "Genre review" })).toHaveAttribute(
      "href",
      "/admin/genre-review",
    );
    expect(screen.getByRole("menuitem", { name: "Root review" })).toHaveAttribute(
      "href",
      "/admin/root-review",
    );
  });

  it("signs out from the menu", () => {
    session = { user: { email: "admin@example.com" } };
    render(<UserMenu />);

    fireEvent.click(screen.getByRole("button", { name: "Account" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Sign out" }));

    expect(signOut).toHaveBeenCalledWith({ redirectTo: "/" });
  });
});
