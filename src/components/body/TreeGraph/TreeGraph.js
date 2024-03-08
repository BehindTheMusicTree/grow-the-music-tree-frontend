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

  const buildTreeHierarchy = () => {
    return d3.stratify()
      .id(d => d.uuid)
      .parentId(d => d.parent?.uuid || null)(genres);
  };
    
  const calculateHighestNodeX = (treeData) => {
    let xMin = treeData.descendants()[0].x;
    treeData.each(node => {
      if (node.x < xMin) {
        xMin = node.x;
      }
    });
    return xMin;
  }
    
  const calculateLowestNodeX = (treeData) => {
    let xMax = treeData.descendants()[0].x;
    treeData.each(node => {
      if (node.x > xMax) {
        xMax = node.x;
      }
    });
    return xMax;
  }

  useEffect(() => {

    const root = buildTreeHierarchy();
    const treeData = d3.tree().nodeSize([VERTICAL_SEPARATOON_BETWEEN_NODES, HORIZONTAL_SEPARATOON_BETWEEN_NODES])(root);
  
    const numberOfLevels = root.height;

    const svgWidth = numberOfLevels * HORIZONTAL_SEPARATOON_BETWEEN_NODES + RECT_WIDTH;
    const lowestNodeX = calculateLowestNodeX(treeData);
    const highestNodeX = calculateHighestNodeX(treeData);

    const xGap = lowestNodeX - highestNodeX;
    const svgHeight = xGap + RECT_HEIGHT;

    const xExtremum = Math.max(Math.abs(lowestNodeX), Math.abs(highestNodeX));
    const xShift = xExtremum - (xGap / 2);
    console.log(xShift);

    const svg = d3.select(svgRef.current)
    .attr('width', svgWidth)
    .attr('height', svgHeight);

    let nodeY

    let firstNodeXCorrected = treeData.descendants()[0].x - xShift;

    const linkGenerator = d3.linkHorizontal()
      .x(d => d.y + RECT_WIDTH / 2)
      .y(d => d.x - firstNodeXCorrected + svgHeight / 2);

    svg.selectAll('path.link')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', linkGenerator);

    svg.selectAll('g.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', function(d) {
        nodeY = RECT_WIDTH / 2 + HORIZONTAL_SEPARATOON_BETWEEN_NODES * d.depth;
        return 'translate(' + nodeY + ',' + (d.x - firstNodeXCorrected + svgHeight / 2) + ')';
      })

    svg.selectAll('g.node')
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
