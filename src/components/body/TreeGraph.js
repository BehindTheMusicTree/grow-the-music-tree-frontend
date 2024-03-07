import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';

function TreeGraph({ genres }) {
  console.log("genres")
  console.log(genres)
  const svgRef = useRef(null);

  useEffect(() => {

    const buildTreeHierarchy = () => {
      return d3.stratify()
        .id(d => d.uuid)
        .parentId(d => d.parent?.uuid || null)(genres);
    };

    // Parse data and build the tree hierarchy
    const root = buildTreeHierarchy();

    const treeLayout = d3.tree().size([500, 300]);

    const treeData = treeLayout(root);

    const svg = d3.select(svgRef.current);

    // Add links (lines connecting nodes)
    svg.selectAll('path.link')
      .data(treeData.links())
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x)
      );

    // Add nodes
    svg.selectAll('g.node')
      .data(treeData.descendants())
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .append('circle')
      .attr('r', 5);

    // Add labels to nodes
    svg.selectAll('g.node')
      .append('text')
      .attr('dy', 3)
      .attr('x', d => (d.children ? -8 : 8))
      .style('text-anchor', d => (d.children ? 'end' : 'start'))
      .text(d => d.data.name);
  }, [genres]);

  // Return JSX
  return (
    <svg ref={svgRef} width="600" height="400">
      {/* SVG elements will be rendered here */}
    </svg>
  );
}

TreeGraph.propTypes = {
    genres: PropTypes.array
}

export default TreeGraph;
