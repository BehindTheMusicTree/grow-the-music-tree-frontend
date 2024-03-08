import './TreeGraph.scss'
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';

function TreeGraph({ genres }) {
  
  const RECT_WIDTH = 220;
  const RECT_HEIGHT = 50;
  const HORIZONTAL_SEPARATOON_BETWEEN_RECTANGLES = 100;
  const VERTICAL_SEPARATOON_BETWEEN_RECTANGLES = 100;
  const HORIZONTAL_SEPARATOON_BETWEEN_NODES = RECT_WIDTH + HORIZONTAL_SEPARATOON_BETWEEN_RECTANGLES;
  const VERTICAL_SEPARATOON_BETWEEN_NODES = RECT_HEIGHT + VERTICAL_SEPARATOON_BETWEEN_RECTANGLES;

  const svgRef = useRef(null);

  useEffect(() => {

    const buildTreeHierarchy = () => {
      return d3.stratify()
        .id(d => d.uuid)
        .parentId(d => d.parent?.uuid || null)(genres);
    };

    const root = buildTreeHierarchy();
    const treeData = d3.tree().nodeSize([VERTICAL_SEPARATOON_BETWEEN_NODES, HORIZONTAL_SEPARATOON_BETWEEN_NODES])(root);
  
    const numberOfLevels = root.height;

    const svgWidth = numberOfLevels * HORIZONTAL_SEPARATOON_BETWEEN_NODES + RECT_WIDTH;
    const svgHeight = (numberOfLevels + 1) * (RECT_HEIGHT + VERTICAL_SEPARATOON_BETWEEN_NODES);

    const svg = d3.select(svgRef.current)
    .attr('width', svgWidth)
    .attr('height', svgHeight);

    let firstNodeX;
    let nodeY

    svg.selectAll('g.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', function(d, i) {
        nodeY = RECT_WIDTH / 2 + HORIZONTAL_SEPARATOON_BETWEEN_NODES * d.depth;
        console.log('X');
        console.log(d.x);
        console.log('Y');
        console.log(d.y);
        if (i === 0) {
          firstNodeX = d.x;
          return 'translate(' + nodeY + ',' + svgHeight / 2 + ')';
        } else {
          return 'translate(' + nodeY + ',' + (d.x - firstNodeX + svgHeight / 2) + ')';
        }
      })
      .append('rect')
      .attr('width', RECT_WIDTH)
      .attr('height', RECT_HEIGHT)
      .attr('x', -RECT_WIDTH / 2)
      .attr('y', -RECT_HEIGHT / 2);

    svg.selectAll('g.node')
      .append('text')
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle')
      .text(function(d) {
        return d.data.name;
      });

    const linkGenerator = d3.linkHorizontal()
    .x(d => d.y)
    .y(d => d.x - firstNodeX + svgHeight / 2);

    svg.selectAll('path.link')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', linkGenerator);
  }, [genres]);

  return (
    <svg ref={svgRef} width="600" height="400" className="tree-graph-svg">
    </svg>
  );
}

TreeGraph.propTypes = {
    genres: PropTypes.array
}

export default TreeGraph;
