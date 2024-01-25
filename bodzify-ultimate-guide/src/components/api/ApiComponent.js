import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ApiComponent = () => {
  const [data, setData] = useState(null);
  
  axios.get('https://bodzify.com/api/v1/genres/', {
    headers: {
      'Authorization': 'Bearer null',
    }
  })
  .then((res) => {
    console.log(res.data)
    setData(res.data)
  })
  .catch((err) => console.error(err))

  useEffect(() => {
    const fetchData = async () => {
    }
  
    fetchData();
  }, []);

  return (
    <div>
      <h2>Data from API:</h2>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default ApiComponent;