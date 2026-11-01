import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { zoomIdentity } from "d3";
import fixture from "@schemas/api/genealogy.fixture.json";
import { GenealogySchema } from "@schemas/api/genealogy";
import GenealogyColumnHeader from "./GenealogyColumnHeader";

const data = GenealogySchema.parse(fixture);

afterEach(cleanup);

function renderHeader(k: number, width = 0) {
  return render(
    <svg>
      <GenealogyColumnHeader columns={data.columns} regions={data.regions} transform={zoomIdentity.scale(k)} width={width} />
    </svg>,
  );
}

describe("GenealogyColumnHeader", () => {
  it("shows the regions in data order", () => {
    renderHeader(1);

    const labels = data.regions.map(({ label }) => screen.getByText(label).textContent);
    expect(labels).toEqual(["Americas", "Europe", "Asia"]);
  });

  it("hides column labels while columns are narrow", () => {
    renderHeader(1);

    expect(screen.queryByText("Bolivia")).toBeNull();
  });

  it("shows column labels when zoomed in, with extra lanes counted and listed in the title", () => {
    renderHeader(2);

    expect(screen.getAllByText("Bolivia")).toHaveLength(2);
    expect(screen.getByText("Abbasid Caliphate +1")).toBeTruthy();
    expect(screen.getByText("Abbasid Caliphate, Ottoman Empire")).toBeTruthy();
  });

  it("skips columns scrolled out of the viewport", () => {
    renderHeader(2, 400);

    expect(screen.queryByText("Indonesia")).toBeNull();
  });
});
