import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { zoomIdentity } from "d3";
import fixture from "@schemas/api/genealogy.fixture.json";
import { GenealogySchema } from "@schemas/api/genealogy";
import GenealogyColumnHeader from "./GenealogyColumnHeader";

const data = GenealogySchema.parse(fixture);

afterEach(cleanup);

function renderHeader(k: number, width = 0, { translateX = 0, top = 0 } = {}) {
  return render(
    <svg>
      <GenealogyColumnHeader
        columns={data.columns}
        regions={data.regions}
        transform={zoomIdentity.translate(translateX, 0).scale(k)}
        width={width}
        top={top}
      />
    </svg>,
  );
}

describe("GenealogyColumnHeader", () => {
  it("shows the regions in data order", () => {
    renderHeader(2);

    const labels = data.regions.map(({ label }) => screen.getByText(label).textContent);
    expect(labels).toEqual(["Americas", "Europe", "Asia"]);
  });

  it("hides a region label its cell is too narrow to hold", () => {
    renderHeader(1);

    expect(screen.queryByText("Americas")).toBeNull();
    expect(screen.getByText("Europe")).toBeTruthy();
  });

  it("hides a region label once its cell is panned too far out of view", () => {
    // Europe's cell ends 30px right of the year axis.
    renderHeader(1, 0, { translateX: -2962 });

    expect(screen.queryByText("Europe")).toBeNull();
    expect(screen.getByText("Asia")).toBeTruthy();
  });

  it("puts region labels below the band kept clear for the app header", () => {
    renderHeader(1, 0, { top: 80 });

    expect(screen.getByText("Europe").getAttribute("y")).toBe("91");
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
