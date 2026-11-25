import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import GenreReviewList from "./GenreReviewList";
import type { ConflictingGenre } from "@schemas/api/genre-name-conflicts";

const mutateMock = vi.fn();
const formErrorsMock = vi.fn((): { field: string; message: string }[] => []);

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api/grow-proxy" }));
vi.mock("@behindthemusictree/app-kit/transport", () => ({
  useFetchWrapper: () => ({ fetch: vi.fn() }),
  useValidatedMutation: () => ({ mutate: mutateMock, formErrors: formErrorsMock(), isPending: false }),
}));

const canonical = {
  uuid: "11111111-1111-4111-8111-111111111111",
  name: "Pub rock",
  wikidataId: "Q1431327",
  parent: null,
  hasNameConflict: false,
};
const flagged = {
  uuid: "22222222-2222-4222-8222-222222222222",
  name: "Pub rock (Q16250593)",
  wikidataId: "Q16250593",
  parent: { uuid: "33333333-3333-4333-8333-333333333333", name: "Rock" },
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
    expect(screen.getByLabelText("Name of Pub rock (Q16250593)")).toHaveValue("Pub rock (Rock)");
    expect(screen.getByText("Parent: Rock")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Q16250593" })).toHaveAttribute(
      "href",
      "https://www.wikidata.org/wiki/Q16250593",
    );
  });

  it("validates the displayed suggestion without requiring an edit", () => {
    render(<GenreReviewList groups={groups} />);

    fireEvent.click(screen.getByRole("button", { name: "Validate" }));

    expect(mutateMock).toHaveBeenCalledWith({
      genres: [
        { uuid: canonical.uuid, name: "Pub rock" },
        { uuid: flagged.uuid, name: "Pub rock (Rock)" },
      ],
    });
  });

  it.each<{ label: string; overrides: Partial<ConflictingGenre> }>([
    { label: "no parent", overrides: { parent: null } },
    { label: "no parent label", overrides: { parent: { ...flagged.parent, name: " " } } },
    { label: "no Wikidata ID", overrides: { wikidataId: null } },
    { label: "no conflict", overrides: { hasNameConflict: false } },
    { label: "an editorial suffix", overrides: { name: "Pub rock (Australia)" } },
    { label: "a different QID suffix", overrides: { name: "Pub rock (Q123)" } },
  ])("keeps the stored name with $label", ({ overrides }) => {
    const genre = { ...flagged, ...overrides };
    render(<GenreReviewList groups={[{ name: "Pub rock", genres: [genre] }]} />);

    expect(screen.getByRole("textbox", { name: `Name of ${genre.name}` })).toHaveValue(genre.name);
    fireEvent.click(screen.getByRole("button", { name: "Validate" }));
    expect(mutateMock).toHaveBeenCalledWith({ genres: [{ uuid: genre.uuid, name: genre.name }] });
  });

  it("preserves existing parentheses and the parent's label verbatim", () => {
    const genre = {
      ...flagged,
      name: "Rock (régional) (Q16250593)",
      parent: { ...flagged.parent, name: "Musique électroacoustique" },
    };
    render(<GenreReviewList groups={[{ name: "Rock (régional)", genres: [genre] }]} />);

    expect(screen.getByRole("textbox", { name: `Name of ${genre.name}` })).toHaveValue(
      "Rock (régional) (Musique électroacoustique)",
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
