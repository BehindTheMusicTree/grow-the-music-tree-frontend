import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import GenreReviewList from "./GenreReviewList";

const mutateMock = vi.fn();
const formErrorsMock = vi.fn((): { field: string; message: string }[] => []);

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api/grow-proxy" }));
vi.mock("@behindthemusictree/app-kit/transport", () => ({
  useFetchWrapper: () => ({ fetch: vi.fn() }),
  useValidatedMutation: () => ({ mutate: mutateMock, formErrors: formErrorsMock(), isPending: false }),
}));

const canonical = {
  uuid: "11111111-1111-1111-1111-111111111111",
  name: "Pub rock",
  wikidataId: "Q1431327",
  parent: null,
  hasNameConflict: false,
};
const flagged = {
  uuid: "22222222-2222-2222-2222-222222222222",
  name: "Pub rock (Q16250593)",
  wikidataId: "Q16250593",
  parent: { uuid: "33333333-3333-3333-3333-333333333333", name: "Rock" },
  hasNameConflict: true,
};
const groups = [{ name: "Pub rock", genres: [canonical, flagged] }];

describe("GenreReviewList", () => {
  afterEach(() => {
    cleanup();
    mutateMock.mockReset();
    formErrorsMock.mockReturnValue([]);
  });

  it("shows every genre of a group with its parent and Wikidata link", () => {
    render(<GenreReviewList groups={groups} />);

    expect(screen.getByRole("heading", { name: "Pub rock" })).toBeInTheDocument();
    expect(screen.getByLabelText("Name of Pub rock (Q16250593)")).toHaveValue("Pub rock (Q16250593)");
    expect(screen.getByText("Parent: Rock")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Q16250593" })).toHaveAttribute(
      "href",
      "https://www.wikidata.org/wiki/Q16250593",
    );
  });

  it("validates the whole group with the edited and unchanged names", () => {
    render(<GenreReviewList groups={groups} />);

    fireEvent.change(screen.getByLabelText("Name of Pub rock (Q16250593)"), {
      target: { value: "Pub rock (Australia)" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Validate" }));

    expect(mutateMock).toHaveBeenCalledWith({
      genres: [
        { uuid: canonical.uuid, name: "Pub rock" },
        { uuid: flagged.uuid, name: "Pub rock (Australia)" },
      ],
    });
  });

  it("shows an error under the genre it is keyed to, and group-level errors below the group", () => {
    formErrorsMock.mockReturnValue([
      { field: flagged.uuid, message: "Name already taken" },
      { field: "genres", message: "Each genre can only appear once" },
    ]);
    render(<GenreReviewList groups={groups} />);

    const flaggedRow = screen.getByLabelText("Name of Pub rock (Q16250593)").closest("div")!.parentElement!;
    expect(flaggedRow).toHaveTextContent("Name already taken");
    expect(screen.getByText("Each genre can only appear once")).toBeInTheDocument();
  });
});
