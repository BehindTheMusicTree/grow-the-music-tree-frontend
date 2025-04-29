export function appendPaths(d3, svg, treeData, xOffset, yOffset) {
  const linkGenerator = d3
    .linkHorizontal()
    .x((d) => d.x + xOffset)
    .y((d) => d.y + yOffset);

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
