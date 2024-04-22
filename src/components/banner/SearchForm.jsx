import { useState } from 'react'
import PropTypes from 'prop-types';

export default function SearchForm({setSearchSubmitted}) {

    const [isFirstFocus, setIsFirstFocus] = useState(true)
    const [searchUnsubmitted, setSearchUnsubmitted] = useState('search')

    const handleSubmit = (e) => {
        e.preventDefault()
        const value = e.target.value
        if (value === '') {
            alert('Please enter a search term')
            return
        }
        else {
            setSearchSubmitted(searchUnsubmitted)
        }
    }

    const handleFocus = () => {
        if (isFirstFocus) {
            setSearchUnsubmitted('')
            setIsFirstFocus(false)
        }
    }

    const handleChange = (e) => {
        setSearchUnsubmitted(e.target.value)
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                className='search-form text-gray-900 p-2 rounded-md border-2 border-gray-900 w-60 h-10'
                type="text"
                name="search"
                onChange={handleChange}
                value={searchUnsubmitted}
                onFocus={handleFocus}
            />
        </form>   
    )
}

SearchForm.propTypes = {
    setSearchSubmitted: PropTypes.func.isRequired
}