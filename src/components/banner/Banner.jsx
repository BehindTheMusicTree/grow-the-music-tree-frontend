import PropTypes from 'prop-types';

import SearchForm from './SearchForm'

export default function Banner({searchSubmitted, setSearchSubmitted}) {
    return (
    <div className='banner p-10 flex flex bg-black text-gray-300'>
        <div className='lest-banner flex flex-col justify-between w-4/5'>
            <h1 className='text-4xl font-bold'>Ultimate Music Guide</h1>
            <h3>by Bodzify</h3>
        </div>
        <div className='right-banner flex flex-col'>
            <SearchForm setSearchSubmitted={setSearchSubmitted}/>
            <span>Search term: {searchSubmitted}</span>
        </div>
    </div>)
}

Banner.propTypes = {
    searchSubmitted: PropTypes.string.isRequired,
    setSearchSubmitted: PropTypes.func.isRequired
}