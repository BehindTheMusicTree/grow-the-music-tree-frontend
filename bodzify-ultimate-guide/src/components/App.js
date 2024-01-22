import React from 'react'
import Banner from './banner/Banner'
import GenreList from './genre/GenreList'
import { useState } from 'react';

function App() {

  const [searchSubmitted, setSearchSubmitted] = useState('search')

  return (
    <div>
      <Banner searchSubmitted={searchSubmitted} setSearchSubmitted={setSearchSubmitted}/>
      <GenreList searchSubmitted={searchSubmitted}/>
    </div>
  )
}

export default App