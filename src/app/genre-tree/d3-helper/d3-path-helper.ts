import * as d3 from "d3";
import { CriteriaPlaylistSimple } from "@domain/playlist/criteria-playlist/simple";
import { calculateNodeDimensions } from "../playlist-tree/constants";

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
    .x((d: D3Node) => {
      const dimensions = calculateNodeDimensions(d.data.uploadedTracksCount);
      return d.x! + dimensions.WIDTH / 2;
    })
    .y((d: D3Node) => {
      const dimensions = calculateNodeDimensions(d.data.uploadedTracksCount);
      return d.y! + dimensions.HEIGHT / 2;
    });

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
