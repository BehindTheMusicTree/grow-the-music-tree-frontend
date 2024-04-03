import styles from './TreeGraph.module.scss'
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import { PlayStates } from '../../../constants';
import ReactDOMServer from 'react-dom/server';
import { FaSpinner } from 'react-icons/fa';

export default function TreeGraph (
  { genres, postGenreAndRefresh, selectPlaylistUuidToPlay, playState, playingPlaylistUuidWithLoadingState }) {
  const RECT_WIDTH = 180;
  const RECT_HEIGHT = 30;
  const HORIZONTAL_SEPARATOON_BETWEEN_RECTANGLES = 20;
  const VERTICAL_SEPARATOON_BETWEEN_RECTANGLES = 20;
  const HORIZONTAL_SEPARATOON_BETWEEN_NODES = RECT_WIDTH + HORIZONTAL_SEPARATOON_BETWEEN_RECTANGLES;
  const VERTICAL_SEPARATOON_BETWEEN_NODES = RECT_HEIGHT + VERTICAL_SEPARATOON_BETWEEN_RECTANGLES;

  const FA_ICON_SIZE = 14;

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
      .attr('class', styles.Link)
      .attr('d', linkGenerator);

    const nodes = svg.selectAll('g.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', styles.Node)
      .attr('transform', function(d) {
        nodeY = RECT_WIDTH / 2 + HORIZONTAL_SEPARATOON_BETWEEN_NODES * d.depth;
        return 'translate(' + nodeY + ',' + (d.x - firstNodeXCorrected + svgHeight / 2) + ')';
      })

    nodes.append('rect')
      .attr('width', RECT_WIDTH)
      .attr('height', RECT_HEIGHT)
      .attr('x', -RECT_WIDTH / 2)
      .attr('y', -RECT_HEIGHT / 2);

    nodes.append('text')
      .attr('class', styles.NodeLabel)
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle')
      .text(function(d) {
        return d.data.name;
      });

    nodes.append('foreignObject')
      .attr('class', styles.SpinnerContainer)
      .attr('width', FA_ICON_SIZE)
      .attr('height', FA_ICON_SIZE)
      .attr('dominant-baseline', 'middle')
      .attr('x', RECT_WIDTH / 2 - 33 - FA_ICON_SIZE / 2)
      .attr('y', - RECT_HEIGHT / 2 + FA_ICON_SIZE / 2)
      .html(function(d) {
        if (playingPlaylistUuidWithLoadingState 
          && playingPlaylistUuidWithLoadingState.uuid === d.data.criteriaPlaylist.uuid
          && playingPlaylistUuidWithLoadingState.isLoading) {
            return ReactDOMServer.renderToString(<FaSpinner size={FA_ICON_SIZE} className={styles.Spinner}/>)
          }
      })
  
    nodes.append('text')
      .attr('class', styles.PlayPauseButton)
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle')
      .attr('x', RECT_WIDTH / 2 - 33)
      .attr('y', 0)
      .style('visibility', function(d) {
        playingPlaylistUuidWithLoadingState 
          && playingPlaylistUuidWithLoadingState.uuid === d.data.criteriaPlaylist.uuid
          && playingPlaylistUuidWithLoadingState.isLoading ? 'hidden' : 'visible';
      })
      .text(function(d) {
        if (d.data.criteriaPlaylist.libraryTracksCount === 0) {
          return '';
        }
        
        if (playingPlaylistUuidWithLoadingState && playingPlaylistUuidWithLoadingState.uuid === d.data.criteriaPlaylist.uuid) {
          if (playingPlaylistUuidWithLoadingState.isLoading) {
            return ''
          }
          return playState === PlayStates.PLAYING ? "⏸" : '►';
        }
        return '►';
      })
      .on('click', function(event, d) {
        if (!playingPlaylistUuidWithLoadingState || 
          playState === PlayStates.STOPPED || 
          playingPlaylistUuidWithLoadingState.uuid !== d.data.criteriaPlaylist.uuid) {
          if (d.data.criteriaPlaylist.libraryTracksCount > 0) {
            event.stopPropagation();
            selectPlaylistUuidToPlay(d.data.criteriaPlaylist.uuid);
          }
        }
      })
      .style('cursor', function(d) {
        if (d.data.criteriaPlaylist.libraryTracksCount > 0) {
          return 'pointer';
        }
        return 'default';
      })

    nodes.append('text')
      .attr('class', styles.PlaylistTracksCountText)
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle')
      .attr('x', RECT_WIDTH / 2 - 20)
      .attr('y', 0)
      .text(function(d) {
        return d.data.criteriaPlaylist.libraryTracksCount;
      })
  
    nodes.append('text')
      .attr('class', styles.PlusButton)
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle')
      .attr('x', RECT_WIDTH / 2 - 10)
      .attr('y', 0)
      .text('+')
      .on('click', function(event, d) {
        event.stopPropagation();
        const name = prompt('New genre name:');
        if (!name) {
          return;
        }
        postGenreAndRefresh({
          name: name,
          parent: d.data.uuid
        })
      })

    nodes.on('mouseover', function() {
        d3.select(this).select("." + styles.PlusButton).style('display', 'block');
      })
      .on('mouseout', function() {
        d3.select(this).select("." + styles.PlusButton).style('display', 'none');
      });

    return () => {
      svg.selectAll('*').remove();
    }
  }, [genres, playState, playingPlaylistUuidWithLoadingState]);

  return (
    <svg ref={svgRef} width="600" height="400" className={styles.TreeGraphSvg}></svg>
  );
}

TreeGraph.propTypes = {
  genres: PropTypes.array.isRequired,
  postGenreAndRefresh: PropTypes.func.isRequired,
  selectPlaylistUuidToPlay: PropTypes.func.isRequired,
  playState: PropTypes.string.isRequired,
  playingPlaylistUuidWithLoadingState: PropTypes.object,
};