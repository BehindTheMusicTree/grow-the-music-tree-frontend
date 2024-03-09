import './Body.scss';
import React, { useState, useEffect } from 'react';
import ApiService from '../../service/apiService';
import TreeGraph from './TreeGraph/TreeGraph';

const Body = () => {
  const [genres, setGenres] = useState(null);
  const [groupedGenres, setGroupedGenres] = useState(null);
  const [isGenreFetchingStarted, setIsGenreFetchingStarted] = useState(false);

  useEffect(() => {
    if (!isGenreFetchingStarted) {
      setIsGenreFetchingStarted(true);
    }
    else {
      fetchGenres();
    }
  }, [isGenreFetchingStarted]);

  useEffect(() => {
    if (genres) {
      setGroupedGenres(getGenresGroupedByRoot(genres));
    }
  }, [genres]);
    
  const fetchGenres = async () => {
    console.log('Fetching genres');
    try {
      const data = await ApiService.fetchData('genres/');
      setGenres(data.results);
    } catch (error) {
      console.error('API request failed:', error.message)
      alert('API request failed. Please check the console for more info.');
    }
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

  return (
    <div>
      <div id="genre-tree">
        <h1>Genre Tree</h1>
        {groupedGenres ? Object.entries(groupedGenres).map(([uuid, genreTree]) => {
          const key = `${uuid}-${Date.now()}`;
          return (
            <TreeGraph key={key} genres={genreTree} fetchGenres={fetchGenres}/>
          );
        }) : (
          <p>Loading data.</p>
        )}
      </div>
    </div>
  );
}

export default Body;
