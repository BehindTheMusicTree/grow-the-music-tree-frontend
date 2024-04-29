import PropTypes from 'prop-types'

import SearchForm from './SearchForm'
import logo from '../../assets/images/logos/umg-logo-maze-100.png'


export default function Banner({searchSubmitted, setSearchSubmitted}) {
    return (
    <div className='p-3 flex flex bg-black text-gray-300'>
        <div className='mr-3 flex flex-col justify-center'>
            <img src={logo} alt='logo' />
        </div>
        <div className='flex flex-col justify-center w-4/5'>
            <h1 className='text-4xl font-bold'>Ultimate Music Guide</h1>
            <h3>by Bodzify</h3>
        </div>
        <div className='flex flex-col justify-center'>
            <SearchForm setSearchSubmitted={setSearchSubmitted}/>
            <span>Search term: {searchSubmitted}</span>
        </div>
    </div>)
}

Banner.propTypes = {
    searchSubmitted: PropTypes.string.isRequired,
    setSearchSubmitted: PropTypes.func.isRequired
}