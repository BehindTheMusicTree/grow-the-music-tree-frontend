import './TreeGraph.scss'
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';

function TreeGraph({ genres }) {
  
  const RECT_WIDTH = 220;
  const RECT_HEIGHT = 50;
  const HORIZONTAL_SEPARATOON_BETWEEN_NODES = 100;
  const VERTICAL_SEPARATOON_BETWEEN_NODES = 50;

  const svgRef = useRef(null);

  useEffect(() => {

    const buildTreeHierarchy = () => {
      return d3.stratify()
        .id(d => d.uuid)
        .parentId(d => d.parent?.uuid || null)(genres);
    };

    const root = buildTreeHierarchy();
    const treeData = d3.tree().nodeSize([100, 200])(root);
  
    const numberOfNodes = root.descendants().length;
    const numberOfLevels = root.height;

    const svgWidth = numberOfNodes * (RECT_WIDTH + HORIZONTAL_SEPARATOON_BETWEEN_NODES);
    const svgHeight = (numberOfLevels + 1) * (RECT_HEIGHT + VERTICAL_SEPARATOON_BETWEEN_NODES);

    const svg = d3.select(svgRef.current)
    .attr('width', svgWidth)
    .attr('height', svgHeight);

    svg.selectAll('path.link')
      .data(treeData.links())
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x)
      );

    let firstNodeX;
    let nodeY

    svg.selectAll('g.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', function(d, i) {
        nodeY = d.y + HORIZONTAL_SEPARATOON_BETWEEN_NODES * d.depth;
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
      // .attr('x', -RECT_WIDTH / 2)
      // .attr('y', -RECT_HEIGHT / 2);
    
    svg.selectAll('g.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', function(d) {
        return 'translate(' + d.y + ',' + d.x + ')';
      })
      .append('circle')
      .attr('r', 2.5) // Rayon du cercle
      .style('fill', 'red'); // Couleur du cercle

    svg.selectAll('g.node')
      .append('text')
      .attr('dy', '.35em')
      .attr('x', function(d) {
        return d.children || d._children ? -13 : 13;
      })
      .attr('text-anchor', function(d) {
        return d.children || d._children ? 'end' : 'start';
      })
      .text(function(d) {
        return d.data.name;
      });
  }, [genres]);

  // Return JSX
  return (
    <svg ref={svgRef} width="600" height="400" className="tree-graph-svg">
      {/* SVG elements will be rendered here */}
    </svg>
  );
}

TreeGraph.propTypes = {
    genres: PropTypes.array
}

export default TreeGraph;
