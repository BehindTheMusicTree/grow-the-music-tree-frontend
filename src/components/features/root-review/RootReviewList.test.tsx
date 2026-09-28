import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import RootReviewList from "./RootReviewList";

const mutateMock = vi.fn();
const formErrorsMock = vi.fn((): { field: string; message: string }[] => []);

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api/grow-proxy" }));
vi.mock("@behindthemusictree/app-kit/transport", () => ({
  useFetchWrapper: () => ({ fetch: vi.fn() }),
  useValidatedMutation: () => ({ mutate: mutateMock, formErrors: formErrorsMock(), isPending: false }),
}));

const pala = { uuid: "11111111-1111-1111-1111-111111111111", name: "Pala", wikidataId: "Q15724583" };

describe("RootReviewList", () => {
  afterEach(() => {
    cleanup();
    mutateMock.mockReset();
    formErrorsMock.mockReturnValue([]);
  });

  it("shows each root with its Wikidata link", () => {
    render(<RootReviewList roots={[pala]} />);

    expect(screen.getByText("Pala")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Q15724583" })).toHaveAttribute(
      "href",
      "https://www.wikidata.org/wiki/Q15724583",
    );
  });

  it("accepts the root by uuid", () => {
    render(<RootReviewList roots={[pala]} />);

    fireEvent.click(screen.getByRole("button", { name: "Accept as root" }));

    expect(mutateMock).toHaveBeenCalledWith({ genres: [{ uuid: pala.uuid }] });
  });

  it("shows errors under the root", () => {
    formErrorsMock.mockReturnValue([{ field: pala.uuid, message: "Genre has a parent" }]);
    render(<RootReviewList roots={[pala]} />);

    expect(screen.getByRole("region", { name: "Pala" })).toHaveTextContent("Genre has a parent");
  });
});
