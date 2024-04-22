import {useState, useRef, useCallback, useEffect} from 'react';
import PropTypes from 'prop-types';

import { GENRE_TREE_RECT_DIMENSIONS } from '../../../constants';
import ApiService from '../../../service/apiService';

import GenreTree from './genre-tree/GenreTree';

export default function GenresPage({
      selectPlaylistUuidToPlay, 
      playingPlaylistUuidWithLoadingState,
      playState,
      refreshGenresSignal}) {
    const [groupedGenres, setGroupedGenres] = useState(null);
    const areGenreLoadingRef = useRef(false);
  
    const getGenresGroupedByRoot = (genres) => {
      const groupedGenres = {}
      genres.forEach(genre => {
        const rootUuid = genre.root.uuid
        if (!groupedGenres[rootUuid]) {
          groupedGenres[rootUuid] = [];
        }
        groupedGenres[rootUuid].push(genre);
      });
      
      return groupedGenres
    };

    const postGenreAndRefresh = async (genreDataToPost) => {
      await ApiService.postGenre(genreDataToPost);
      fetchGenresIfNotLoading();
    };
    const postLibTracksAndRefresh = async (file, genreUuid) => {
      await ApiService.postLibTracks(file, genreUuid);
      fetchGenresIfNotLoading();
    }

    const fetchGenresIfNotLoading = useCallback(async () => {
      if (!areGenreLoadingRef.current) {
        areGenreLoadingRef.current = true;
        const genres = await ApiService.getGenres();
        setGroupedGenres(getGenresGroupedByRoot(genres));
      }
    }, []);

    const handleGenreAddClick = (event, parentUuid) => {
      event.stopPropagation();
      const name = prompt('New genre name:');
      if (!name) {
        return;
      }
      postGenreAndRefresh({
        name: name,
        parent: parentUuid
      })
    }

    useEffect(() => {
      fetchGenresIfNotLoading();
    }, [refreshGenresSignal]);

    useEffect(() => {
      const fetchAndSetGenres = async () => {
        const genres = await ApiService.getGenres();
        setGroupedGenres(getGenresGroupedByRoot(genres));
      }
      
      if (!areGenreLoadingRef.current) {
        areGenreLoadingRef.current = true;
        fetchAndSetGenres();
      }
    }, [fetchGenresIfNotLoading]);
  
    useEffect(() => {
      areGenreLoadingRef.current = false;
    }, [groupedGenres]);

    return (
        <div className="flex flex-col"> 
          <h1>Genre Tree</h1>
          <div 
          className="flex justify-center items-center text-center hover:bg-gray-400 hover:text-gray-800 cursor-pointer"
          style={{
              width: GENRE_TREE_RECT_DIMENSIONS.WIDTH + 'px',
              height: GENRE_TREE_RECT_DIMENSIONS.HEIGHT + 'px',
              border: '1px solid black'
          }}
          onClick={handleGenreAddClick}>+</div>
          <div className="flex flex-col bg-gray-400 text-gray-800">
            {groupedGenres ? Object.entries(groupedGenres).map(([uuid, genreTree]) => {
              return (
                <GenreTree 
                  key={`${uuid}`} 
                  genres={genreTree} 
                  handleGenreAddClick={handleGenreAddClick} 
                  selectPlaylistUuidToPlay={selectPlaylistUuidToPlay}
                  playState={playState}
                  playingPlaylistUuidWithLoadingState={playingPlaylistUuidWithLoadingState}
                  postLibTracksAndRefresh={postLibTracksAndRefresh}/>
              );
            }) : (
              <p>Loading data.</p>
            )}
          </div>
        </div>
    );
} 

GenresPage.propTypes = {
    selectPlaylistUuidToPlay: PropTypes.func.isRequired,
    playingPlaylistUuidWithLoadingState: PropTypes.object,
    playState: PropTypes.string.isRequired,
    refreshGenresSignal: PropTypes.number.isRequired
};