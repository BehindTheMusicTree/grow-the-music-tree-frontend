import * as d3 from "d3";
import { CriteriaPlaylistSimple } from "@domain/playlist/criteria-playlist/simple";

type D3Selection = d3.Selection<SVGGElement, unknown, null, undefined>;
type D3Node = d3.HierarchyNode<CriteriaPlaylistSimple>;
type D3Link = d3.HierarchyLink<CriteriaPlaylistSimple>;

export function appendPaths(
  d3: typeof import("d3"),
  svg: D3Selection,
  treeData: D3Node,
  xOffset: number,
  yOffset: number
) {
  const linkGenerator = d3
    .linkHorizontal<D3Link, D3Node>()
    .x((d) => (d as unknown as D3Link).source.x! + xOffset)
    .y((d) => (d as unknown as D3Link).source.y! + yOffset);

  svg
    .selectAll("path.link")
    .data(treeData.links())
    .enter()
    .append("path")
    .attr("d", linkGenerator)
    .style("fill", "none")
    .style("stroke", "black")
    .style("stroke-opacity", 1)
    .style("stroke-width", 2);
}
