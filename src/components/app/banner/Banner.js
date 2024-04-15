import './Banner.css'
import React from 'react'
import Header from './Header'
import Description from './Description'
import SearchForm from './SearchForm'
import PropTypes from 'prop-types';

export default function Banner({searchSubmitted, setSearchSubmitted}) {
    return (
    <div className='banner'>
        <Header />
        <Description />
        <SearchForm setSearchSubmitted={setSearchSubmitted}/>
        <span>Search term: {searchSubmitted}</span>
    </div>)
}

Banner.propTypes = {
    searchSubmitted: PropTypes.string.isRequired,
    setSearchSubmitted: PropTypes.func.isRequired
}