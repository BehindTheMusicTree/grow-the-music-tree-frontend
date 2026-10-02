import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import CurationGenrePage from "./page";

const authMock = vi.fn();
const fetchRulesMock = vi.fn();

vi.mock("@lib/auth", () => ({ auth: () => authMock() }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT ${url}`);
  },
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));
vi.mock("@lib/curation", () => ({
  fetchCurationLists: async () => [],
  fetchCurationRules: (itemId: string) => fetchRulesMock(itemId),
}));
vi.mock("@components/features/curation/CurationBanner", () => ({ default: () => null }));
vi.mock("@components/features/curation/CurationGenreRules", () => ({ default: () => null }));

const params = (itemId: string) => ({ params: Promise.resolve({ itemId }) });

describe("CurationGenrePage", () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({ user: {} });
    fetchRulesMock.mockResolvedValue({ results: [], labels: { Q1: "Rock" } });
  });

  it("redirects to /admin when not signed in", async () => {
    authMock.mockResolvedValue(null);
    await expect(CurationGenrePage(params("Q1"))).rejects.toThrow("NEXT_REDIRECT /admin");
    expect(fetchRulesMock).not.toHaveBeenCalled();
  });

  it("is not found for something that is not a genre id", async () => {
    await expect(CurationGenrePage(params("rock"))).rejects.toThrow("NEXT_NOT_FOUND");
    expect(fetchRulesMock).not.toHaveBeenCalled();
  });

  it("titles a Wikidata genre by name and links to Wikidata", async () => {
    render(await CurationGenrePage(params("Q1")));
    expect(screen.getByRole("heading", { level: 1, name: "Rock" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voir sur Wikidata" })).toHaveAttribute(
      "href",
      "https://www.wikidata.org/wiki/Q1",
    );
  });

  it("decodes a local id and offers no Wikidata link", async () => {
    render(await CurationGenrePage(params("LOCAL%3Aafro-jazz")));
    expect(fetchRulesMock).toHaveBeenCalledWith("LOCAL:afro-jazz");
    expect(screen.getByRole("heading", { level: 1, name: "LOCAL:afro-jazz" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Voir sur Wikidata" })).not.toBeInTheDocument();
  });
});
