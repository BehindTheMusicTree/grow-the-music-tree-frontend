import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import type { z } from "zod";
import GenreHistory from "./GenreHistory";

const fetchMock = vi.fn();

vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api/grow-proxy" }));
vi.mock("@behindthemusictree/app-kit/transport", () => ({
  useFetchWrapper: () => ({ fetch: fetchMock }),
  useQueryWithParse: ({
    queryFn,
    schema,
    ...options
  }: {
    queryKey: unknown[];
    queryFn: () => Promise<unknown>;
    schema: z.ZodTypeAny;
  }) => useQuery({ ...options, queryFn: async () => schema.parse(await queryFn()) }),
}));

const GENRE_UUID = "11111111-1111-1111-1111-111111111111";

function renderHistory() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <GenreHistory genreUuid={GENRE_UUID} />
    </QueryClientProvider>,
  );
}

const entry = (overrides: Record<string, unknown>) => ({
  uuid: crypto.randomUUID(),
  actorPseudo: null,
  oldValue: null,
  newValue: null,
  createdOn: "2026-09-30T10:00:00Z",
  ...overrides,
});

describe("GenreHistory", () => {
  afterEach(() => {
    cleanup();
    fetchMock.mockReset();
  });

  it("lists entries in the order the API returns them (newest first) with human labels", async () => {
    fetchMock.mockResolvedValue([
      entry({ action: "renamed", actorPseudo: "alice", oldValue: "Pub Rock", newValue: "Pub rock" }),
      entry({ action: "parent_changed", actorPseudo: "bob", oldValue: "Rock", newValue: "Punk" }),
      entry({ action: "created", createdOn: "2026-01-01T00:00:00Z" }),
    ]);

    renderHistory();

    const items = within(await screen.findByRole("list")).getAllByRole("listitem");
    expect(fetchMock).toHaveBeenCalledWith(`genres/${GENRE_UUID}/history/`, true, false);
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("Renamed Pub Rock → Pub rock by alice");
    expect(items[1]).toHaveTextContent("Moved from Rock to Punk by bob");
    expect(items[2]).toHaveTextContent("Created by Pipeline");
    expect(screen.getByText(new Date("2026-01-01T00:00:00Z").toLocaleDateString())).toHaveAttribute(
      "dateTime",
      "2026-01-01T00:00:00Z",
    );
  });

  it("shows a dash when the genre has no modifications", async () => {
    fetchMock.mockResolvedValue([]);

    renderHistory();

    expect(await screen.findByText("—")).toBeInTheDocument();
    expect(screen.getByText("Modifications")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
