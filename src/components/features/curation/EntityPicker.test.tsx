import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import EntityPicker from "./EntityPicker";

const targets = [
  { id: "Q1356", name: "Maharashtra", kind: "admin_unit", hidden: false },
  { id: "Q18677875", name: "Normandy", kind: "admin_unit", hidden: true },
];

vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api" }));
vi.mock("@behindthemusictree/app-kit/transport", () => ({
  useFetchWrapper: () => ({ fetch: vi.fn() }),
  useQueryWithParse: () => ({ data: targets }),
}));

describe("EntityPicker", () => {
  afterEach(cleanup);

  it("offers drawn and hidden regions and names the selected one", () => {
    render(<EntityPicker label="Entité" value="Q18677875" onChange={vi.fn()} />);

    expect(screen.getByText("Normandy")).toBeInTheDocument();
    expect(document.querySelectorAll("datalist option")).toHaveLength(2);
    expect(document.querySelector('datalist option[value="Q18677875"]')?.textContent).toBe("Normandy (masquée)");
  });

  it("passes a typed id up, including one the map does not list", () => {
    const onChange = vi.fn();
    render(<EntityPicker label="Entité" value="" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Entité"), { target: { value: "stan1295" } });

    expect(onChange).toHaveBeenCalledWith("stan1295");
  });
});
