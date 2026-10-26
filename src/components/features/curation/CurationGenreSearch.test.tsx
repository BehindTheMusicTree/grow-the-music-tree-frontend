import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CurationGenreSearch from "./CurationGenreSearch";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api/grow-proxy" }));
vi.mock("@behindthemusictree/app-kit/transport", () => ({
  useFetchWrapper: () => ({ fetch: vi.fn() }),
  useQueryWithParse: () => ({ data: undefined, isFetching: false }),
}));

describe("CurationGenreSearch", () => {
  it("opens the rules page of the chosen genre", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <CurationGenreSearch />
      </QueryClientProvider>,
    );
    const submit = screen.getByRole("button", { name: "Voir les règles" });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByRole("combobox", { name: "Règles d'un genre" }), { target: { value: "LOCAL:afro-jazz" } });
    fireEvent.click(submit);

    expect(pushMock).toHaveBeenCalledWith("/admin/curation/genre/LOCAL%3Aafro-jazz");
  });
});
