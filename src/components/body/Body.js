import './Body.scss';
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ApiService from '../../service/apiService';
import TreeGraph from './TreeGraph/TreeGraph';

const Body = ({setSelectedPlaylistUuid}) => {
  const [groupedGenres, setGroupedGenres] = useState(null);
  const [mustFetchGenres, setMustFetchGenres] = useState(true);

  const isGenreFetchingRef = useRef(false);

  const postGenreAndRefresh = async (genreDataToPost) => {
    await ApiService.postGenre(genreDataToPost);
    setMustFetchGenres(true);
  };

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

  useEffect(() => {
    const fetchGenres = async () => {
      return await ApiService.getGenres();
    }

    const fetchAndSetGenres = async () => {
      const genres = await fetchGenres();
      setGroupedGenres(getGenresGroupedByRoot(genres));
    }
    
    if (mustFetchGenres && !isGenreFetchingRef.current) {
      setMustFetchGenres(false);
      isGenreFetchingRef.current = true;
      fetchAndSetGenres();
      isGenreFetchingRef.current = false;
    }
  }, [mustFetchGenres]);

  return (
    <div>
      <div id="genre-tree">
        <h1>Genre Tree</h1>
        {groupedGenres ? Object.entries(groupedGenres).map(([uuid, genreTree]) => {
          const key = `${uuid}-${Date.now()}`;
          return (
            <TreeGraph 
              key={key} 
              genres={genreTree} 
              postGenreAndRefresh={postGenreAndRefresh} 
              setSelectedPlaylistUuid={setSelectedPlaylistUuid}/>
          );
        }) : (
          <p>Loading data.</p>
        )}
      </div>
    </div>
  );
}

Body.propTypes = {
  setSelectedPlaylistUuid: PropTypes.func.isRequired
};

export default Body;
