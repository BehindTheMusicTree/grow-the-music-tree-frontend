import styles from './TreeGraph.module.scss'
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import { PLAY_STATES, GENRE_TREE_RECT_DIMENSIONS } from '../../../constants';
import ReactDOMServer from 'react-dom/server';
import { FaSpinner, FaFileUpload } from 'react-icons/fa';

export default function TreeGraph (
  { genres, 
    handleGenreAddClick, 
    selectPlaylistUuidToPlay, 
    playState, 
    playingPlaylistUuidWithLoadingState,
    postLibTracksAndRefresh }) {
  const HORIZONTAL_SEPARATOON_BETWEEN_RECTANGLES = 20;
  const VERTICAL_SEPARATOON_BETWEEN_RECTANGLES = 20;
  const HORIZONTAL_SEPARATOON_BETWEEN_NODES = (
    GENRE_TREE_RECT_DIMENSIONS.WIDTH + HORIZONTAL_SEPARATOON_BETWEEN_RECTANGLES
  )
  const VERTICAL_SEPARATOON_BETWEEN_NODES = (
    GENRE_TREE_RECT_DIMENSIONS.HEIGHT + VERTICAL_SEPARATOON_BETWEEN_RECTANGLES
  )

  const svgRef = useRef(null);
  const fileInputRef = useRef(null);
  const selectingFileGenreUuidRef = useRef(null);

  function handleFileChange(event) {
    const file = event.target.files[0];
    postLibTracksAndRefresh(file, selectingFileGenreUuidRef.current);
  }

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

    const svgWidth = numberOfLevels * HORIZONTAL_SEPARATOON_BETWEEN_NODES + GENRE_TREE_RECT_DIMENSIONS.WIDTH;
    const lowestNodeX = calculateLowestNodeX(treeData);
    const highestNodeX = calculateHighestNodeX(treeData);

    const xGap = lowestNodeX - highestNodeX;
    const svgHeight = xGap + GENRE_TREE_RECT_DIMENSIONS.HEIGHT;

    const xExtremum = Math.max(Math.abs(lowestNodeX), Math.abs(highestNodeX));
    const xShift = xExtremum - (xGap / 2);

    const svg = d3.select(svgRef.current)
    .attr('width', svgWidth)
    .attr('height', svgHeight);

    let nodeY

    let firstNodeXCorrected = treeData.descendants()[0].x - xShift;

    const linkGenerator = d3.linkHorizontal()
      .x(d => d.y + GENRE_TREE_RECT_DIMENSIONS.WIDTH / 2)
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
        nodeY = GENRE_TREE_RECT_DIMENSIONS.WIDTH / 2 + HORIZONTAL_SEPARATOON_BETWEEN_NODES * d.depth;
        return 'translate(' + nodeY + ',' + (d.x - firstNodeXCorrected + svgHeight / 2) + ')';
      })

    nodes.append('rect')
      .attr('width', GENRE_TREE_RECT_DIMENSIONS.WIDTH)
      .attr('height', GENRE_TREE_RECT_DIMENSIONS.HEIGHT)
      .attr('x', -GENRE_TREE_RECT_DIMENSIONS.WIDTH / 2)
      .attr('y', -GENRE_TREE_RECT_DIMENSIONS.HEIGHT / 2);

    nodes.append('text')
      .attr('class', styles.NodeLabel)
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle')
      .text(function(d) {
        return d.data.name;
      });
  
    const TRACK_UPLOADED_BUTTON_OFFSET = 10;
    const PLUS_BUTTON_OFFSET = TRACK_UPLOADED_BUTTON_OFFSET + 13;
    const PLAYLIST_TRACKS_COUNT_TEXT_OFFSET = PLUS_BUTTON_OFFSET + 13;
    const PLAY_PAUSE_BUTTON_OFFSET = PLAYLIST_TRACKS_COUNT_TEXT_OFFSET + 13;

    const SPINNER_ICON_SIZE = 14;
    nodes.append('foreignObject')
      .attr('class', styles.SpinnerContainer)
      .attr('width', SPINNER_ICON_SIZE)
      .attr('height', SPINNER_ICON_SIZE)
      .attr('dominant-baseline', 'middle')
      .attr('x', GENRE_TREE_RECT_DIMENSIONS.WIDTH / 2 - PLAY_PAUSE_BUTTON_OFFSET - SPINNER_ICON_SIZE / 2)
      .attr('y', - GENRE_TREE_RECT_DIMENSIONS.HEIGHT / 2 + SPINNER_ICON_SIZE / 2)
      .html(function(d) {
        if (playingPlaylistUuidWithLoadingState 
          && playingPlaylistUuidWithLoadingState.uuid === d.data.criteriaPlaylist.uuid
          && playingPlaylistUuidWithLoadingState.isLoading) {
            return ReactDOMServer.renderToString(<FaSpinner size={SPINNER_ICON_SIZE} className={styles.Spinner}/>)
          }
      })

    nodes.append('text')
      .attr('class', styles.PlayPauseButton)
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle')
      .attr('x', GENRE_TREE_RECT_DIMENSIONS.WIDTH / 2 - PLAY_PAUSE_BUTTON_OFFSET)
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
          return playState === PLAY_STATES.PLAYING ? "⏸" : '►';
        }
        return '►';
      })
      .on('click', function(event, d) {
        if (!playingPlaylistUuidWithLoadingState || 
          playState === PLAY_STATES.STOPPED || 
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
      .attr('x', GENRE_TREE_RECT_DIMENSIONS.WIDTH / 2 - PLAYLIST_TRACKS_COUNT_TEXT_OFFSET)
      .attr('y', 0)
      .text(function(d) {
        return d.data.criteriaPlaylist.libraryTracksCount;
      })
  
    nodes.append('text')
      .attr('class', styles.PlusButton)
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle')
      .attr('x', GENRE_TREE_RECT_DIMENSIONS.WIDTH / 2 - PLUS_BUTTON_OFFSET)
      .attr('y', 0)
      .text('+')
      .on('click', function(event, d) {
        handleGenreAddClick(event, d.data.uuid);
      })

    const TRACK_UPLOAD_ICON = {
      WIDTH: 14,
      HEIGHT: 16,
    }

    nodes.append('foreignObject')
      .attr('class', styles.TrackUploadButtonContainer)
      .attr('width', TRACK_UPLOAD_ICON.WIDTH)
      .attr('height', TRACK_UPLOAD_ICON.HEIGHT)
      .attr('dominant-baseline', 'middle')
      .attr('x', GENRE_TREE_RECT_DIMENSIONS.WIDTH / 2 - TRACK_UPLOADED_BUTTON_OFFSET - TRACK_UPLOAD_ICON.WIDTH / 2)
      .attr('y', - (GENRE_TREE_RECT_DIMENSIONS.HEIGHT - TRACK_UPLOAD_ICON.HEIGHT) / 2)
      .html(function() {
        return ReactDOMServer.renderToString(
          <div className={styles.TrackUploadIconContainer}>
            <FaFileUpload size={TRACK_UPLOAD_ICON.WIDTH} />
          </div>
      )})
      .on('click', function(event, d) {
        event.stopPropagation();
        selectingFileGenreUuidRef.current = d.data.uuid;
        fileInputRef.current.click();
      })

    nodes.on('mouseover', function() {
      for (let className of [styles.PlusButton, styles.TrackUploadButtonContainer]) {
        d3.select(this).select("." + className).style('display', 'block');
      }
    })
    .on('mouseout', function() {
      for (let className of [styles.PlusButton, styles.TrackUploadButtonContainer]) {
        d3.select(this).select("." + className).style('display', 'none');
      }
    });

    return () => {
      svg.selectAll('*').remove();
    }
  }, [genres, playState, playingPlaylistUuidWithLoadingState]);

  return (
    <div>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
      <svg ref={svgRef} width="600" height="400" className={styles.TreeGraphSvg}></svg>
    </div>
  );
}

TreeGraph.propTypes = {
  genres: PropTypes.array.isRequired,
  handleGenreAddClick: PropTypes.func.isRequired,
  selectPlaylistUuidToPlay: PropTypes.func.isRequired,
  playState: PropTypes.string.isRequired,
  playingPlaylistUuidWithLoadingState: PropTypes.object,
  postLibTracksAndRefresh: PropTypes.func.isRequired,
};