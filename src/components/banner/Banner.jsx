import Header from './Header'
import SearchForm from './SearchForm'
import PropTypes from 'prop-types';

export default function Banner({searchSubmitted, setSearchSubmitted}) {
    return (
    <div className='banner p-10 flex flex-col'>
        <Header />
        <SearchForm setSearchSubmitted={setSearchSubmitted}/>
        <span>Search term: {searchSubmitted}</span>
    </div>)
}

Banner.propTypes = {
    searchSubmitted: PropTypes.string.isRequired,
    setSearchSubmitted: PropTypes.func.isRequired
}