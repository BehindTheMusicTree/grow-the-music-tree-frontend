import React, { useState } from 'react';
import ApiService from '../../service/apiService';
import TreeGraph from './TreeGraph';

const Body = () => {
  const [genres, setGenres] = useState(null);

  const fetchGenres = async () => {
    try {
      const data = await ApiService.fetchData('genres/');
      setGenres(data);
    } catch (error) {
      console.error('API request failed:', error.message)
      alert('API request failed. Please check the console for more info.');
    }
  };

  const renderTree = () => {
    if (genres) {
      return <TreeGraph data={genres} />;
    } else {
      return <p>No genres data available.</p>;
    }
  };

  return (
    <div>
      <div>
        <button onClick={fetchGenres}>Fetch Data</button>
        <h2>API Data:</h2>
        {genres ? (
          <pre>{JSON.stringify(genres, null, 2)}</pre>
        ) : (
          <p>Click &quot;Fetch Data&quot; to load API data.</p>
        )}

        <h1>Tree Graph</h1>
        {renderTree()}
      </div>
    </div>
  );
};

export default Body;
