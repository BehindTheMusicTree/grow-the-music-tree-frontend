import './Body.scss';
import React, { useState, useEffect } from 'react';
import ApiService from '../../service/apiService';
import TreeGraph from './TreeGraph/TreeGraph';

const Body = () => {
  const [genres, setGenres] = useState(null);
  const [groupedGenres, setGroupedGenres] = useState(null);
  const [isGenreFetchingStarted, setIsGenreFetchingStarted] = useState(false);
  const [genreDataToPost, setGenreDataToPost] = useState(null);

  const postGenre = async (genreDataToPost) => {
    await ApiService.postGenre(genreDataToPost);
    const genres = await ApiService.getGenres();
    setGenres(genres);
  };
    
  const fetchGenres = async () => {
    const genres = await ApiService.getGenres()
    setGenres(genres);
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

  useEffect(() => {
    if (genreDataToPost) {
      postGenre(genreDataToPost);
    }
  }, [genreDataToPost]);

  return (
    <div>
      <div id="genre-tree">
        <h1>Genre Tree</h1>
        {groupedGenres ? Object.entries(groupedGenres).map(([uuid, genreTree]) => {
          const key = `${uuid}-${Date.now()}`;
          return (
            <TreeGraph key={key} genres={genreTree} setGenreDataToPost={setGenreDataToPost}/>
          );
        }) : (
          <p>Loading data.</p>
        )}
      </div>
    </div>
  );
}

export default Body;
