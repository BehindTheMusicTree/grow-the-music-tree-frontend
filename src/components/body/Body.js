import './Body.scss';
import React, { useState, useEffect } from 'react';
import ApiService from '../../service/apiService';
import TreeGraph from './TreeGraph/TreeGraph';

const Body = () => {
  const [genres, setGenres] = useState(null);
  const [groupedGenres, setGroupedGenres] = useState(null);
  const [isGenreFetchingStarted, setIsGenreFetchingStarted] = useState(false);
  const [areGenreGroupsCreated, setAreGenreGroupsCreated] = useState(false);

  useEffect(() => {
    console.log('Body useEffect ', isGenreFetchingStarted);
    if (!isGenreFetchingStarted) {
      setIsGenreFetchingStarted(true);
    }
    else {
      fetchGenres();
    }
  }, [isGenreFetchingStarted]);

  useEffect(() => {
    if (genres) {
      console.log('Body genres ', genres);
      setGroupedGenres(getGenresGroupedByRoot(genres));
    }
  }, [genres]);

  useEffect(() => {
    console.log('Body groupedGenres ');
    if (groupedGenres) {
      console.log('groupedGenres ', groupedGenres)
      setAreGenreGroupsCreated(true);
      // console.log('Body useEffect ', Object.entries(groupedGenres).map(([uuid, genreTree]) => {
      //   return { uuid, genreTree }
      // }));
    }
  }, [groupedGenres]);

    
  const fetchGenres = async () => {
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
        {groupedGenres && areGenreGroupsCreated ? Object.entries(groupedGenres).map(([uuid, genreTree]) => {
          return (
            <TreeGraph key={uuid} genres={genreTree}/>
          );
        }) : (
          <p>Loading data.</p>
        )}
      </div>
    </div>
  );
}

export default Body;
