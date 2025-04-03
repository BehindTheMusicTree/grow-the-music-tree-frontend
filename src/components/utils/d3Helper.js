export function addGrid(svg, width, height, gridIsHidden) {
  const SPACING = 50;
  if (!gridIsHidden) {
    const gridGroup = svg.append("g").attr("class", "grid");

    // Add horizontal lines and numbers
    for (let y = 0; y <= height; y += SPACING) {
      gridGroup
        .append("line")
        .attr("x1", 0)
        .attr("y1", y)
        .attr("x2", width)
        .attr("y2", y)
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1);

      gridGroup
        .append("text")
        .attr("x", 5)
        .attr("y", y - 5)
        .attr("fill", "#000")
        .attr("font-size", "10px")
        .text(y);
    }

    // Add vertical lines and numbers
    for (let x = 0; x <= width; x += SPACING) {
      gridGroup
        .append("line")
        .attr("x1", x)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", height)
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1);

      gridGroup
        .append("text")
        .attr("x", x + 5)
        .attr("y", 15)
        .attr("fill", "#000")
        .attr("font-size", "10px")
        .text(x);
    }
  }
}
